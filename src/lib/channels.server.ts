import { supabaseAdmin } from '@/integrations/supabase/client.server';

export type Platform = 'whatsapp' | 'facebook' | 'instagram';
export const GRAPH = 'https://graph.facebook.com/v21.0';

export function allowedOrigin(origin: string) {
  try {
    const u = new URL(origin);
    const ok = u.protocol === 'https:' ? /(\.lovable\.app|\.lovableproject\.com)$/.test(u.hostname) || Boolean(process.env['APP_PUBLIC_ORIGIN'] && origin === process.env['APP_PUBLIC_ORIGIN']) : u.hostname === 'localhost';
    return ok ? u.origin : null;
  } catch { return null; }
}

/** Returns the caller's client (workspace), creating one on first use. */
export async function ensureClientForUser(userId: string, email?: string | null) {
  const { data: member } = await supabaseAdmin.from('client_members').select('client_id').eq('user_id', userId).eq('status', 'active').order('created_at').limit(1).maybeSingle();
  if (member) return member.client_id;
  const { data, error } = await supabaseAdmin.from('clients').insert({ name: email?.split('@')[0] || 'متجري', created_by: userId }).select('id').single();
  if (error) throw new Error('تعذر إنشاء مساحة العمل');
  return data.id;
}

export async function evolution(path: string, init: RequestInit = {}) {
  const base = process.env['EVOLUTION_API_URL']?.replace(/\/+$/, '');
  const key = process.env['EVOLUTION_API_KEY'];
  if (!base || !key) throw new Error('خادم واتساب غير مُعدّ');
  const res = await fetch(base + path, { ...init, headers: { 'Content-Type': 'application/json', apikey: key, ...(init.headers ?? {}) } });
  const text = await res.text();
  let body: any = null; try { body = text ? JSON.parse(text) : null; } catch { body = text; }
  if (!res.ok) {
    const msg = typeof body === 'object' ? (body?.response?.message ?? body?.message ?? body?.error) : body;
    const err = new Error(Array.isArray(msg) ? msg.join('، ') : String(msg || `خطأ من خادم واتساب (${res.status})`)) as Error & { status?: number };
    err.status = res.status; throw err;
  }
  return body;
}

export async function hmacHex(secret: string, payload: string) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload));
  return [...new Uint8Array(sig)].map(b => b.toString(16).padStart(2, '0')).join('');
}
export function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let r = 0; for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}
export function randomToken(bytes = 24) {
  return [...crypto.getRandomValues(new Uint8Array(bytes))].map(b => b.toString(16).padStart(2, '0')).join('');
}

/** Stores an inbound/outbound message, upserting contact and conversation. */
export async function ingestMessage(m: { clientId: string; platform: Platform; threadId: string; externalId: string; name?: string | null; phone?: string | null; direction: 'inbound' | 'outbound'; body: string | null; contentType: string; mediaUrl?: string | null; sentAt: Date; payload: unknown }) {
  const { data: contact } = await supabaseAdmin.from('contacts').upsert({ client_id: m.clientId, platform: m.platform, external_id: m.threadId, name: m.name ?? null, phone: m.phone ?? null }, { onConflict: 'client_id,platform,external_id', ignoreDuplicates: false }).select('id').single();
  const { data: existing } = await supabaseAdmin.from('conversations').select('id, unread_count').eq('client_id', m.clientId).eq('platform', m.platform).eq('external_thread_id', m.threadId).maybeSingle();
  const preview = (m.body ?? `[${m.contentType}]`).slice(0, 140);
  let conversationId = existing?.id;
  if (existing) {
    await supabaseAdmin.from('conversations').update({ last_message_at: m.sentAt.toISOString(), last_message_preview: preview, unread_count: existing.unread_count + (m.direction === 'inbound' ? 1 : 0), contact_id: contact?.id ?? null }).eq('id', existing.id);
  } else {
    const { data } = await supabaseAdmin.from('conversations').insert({ client_id: m.clientId, platform: m.platform, external_thread_id: m.threadId, contact_id: contact?.id ?? null, subject: m.name ?? m.phone ?? null, status: 'open', unread_count: m.direction === 'inbound' ? 1 : 0, last_message_at: m.sentAt.toISOString(), last_message_preview: preview }).select('id').single();
    conversationId = data?.id;
  }
  if (!conversationId) throw new Error('conversation upsert failed');
  await supabaseAdmin.from('messages').upsert({ client_id: m.clientId, conversation_id: conversationId, platform: m.platform, direction: m.direction, external_message_id: m.externalId, sender_type: m.direction === 'inbound' ? 'contact' : 'agent', content_type: m.contentType, body: m.body, media_url: m.mediaUrl ?? null, payload: m.payload as never, status: m.direction === 'inbound' ? 'delivered' : 'sent', sent_at: m.sentAt.toISOString() }, { onConflict: 'client_id,platform,external_message_id', ignoreDuplicates: true });
}

export async function logEvent(e: { clientId?: string | null; platform: Platform; type: string; externalId?: string | null; payload: unknown; status: 'received' | 'processed' | 'failed' | 'ignored'; error?: string | null }) {
  await supabaseAdmin.from('webhook_events').insert({ client_id: e.clientId ?? null, platform: e.platform, event_type: e.type, external_id: e.externalId ?? null, payload: e.payload as never, status: e.status, error: e.error ?? null, processed_at: e.status === 'received' ? null : new Date().toISOString() });
}
