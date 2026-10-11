import { supabaseAdmin } from '@/integrations/supabase/client.server';
import { evolution } from './channels.server';
import type { Database } from '@/integrations/supabase/types';

export type WaSettings = Database['public']['Tables']['whatsapp_settings']['Row'];
type Hours = Record<string, { open: boolean; from: string; to: string }>;

const AI_MODEL = 'openai/gpt-6-astra';
const AI_BASE = 'https://ai.gateway.lovable.dev';

export async function loadSettings(clientId: string): Promise<WaSettings | null> {
  const { data } = await supabaseAdmin.from('whatsapp_settings').select('*').eq('client_id', clientId).maybeSingle();
  return data ?? null;
}

export async function notify(clientId: string, kind: 'new_message' | 'disconnected' | 'error' | 'info', title: string, body?: string | null) {
  const s = await loadSettings(clientId);
  const enabled = !s || (kind === 'new_message' ? s.notify_new_message : kind === 'disconnected' ? s.notify_disconnect : kind === 'error' ? s.notify_errors : true);
  if (!enabled) return;
  await supabaseAdmin.from('client_notifications').insert({ client_id: clientId, platform: 'whatsapp', kind, title, body: body?.slice(0, 500) ?? null });
}

/** True when "now" falls inside the store's configured business hours (in its timezone). */
export function withinHours(s: Pick<WaSettings, 'hours_enabled' | 'timezone' | 'business_hours'>, now = new Date()) {
  if (!s.hours_enabled) return true;
  let parts: Intl.DateTimeFormatPart[];
  try { parts = new Intl.DateTimeFormat('en-US', { timeZone: s.timezone, weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(now); }
  catch { parts = new Intl.DateTimeFormat('en-US', { timeZone: 'UTC', weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(now); }
  const wd = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(parts.find(p => p.type === 'weekday')?.value ?? '');
  const hm = `${parts.find(p => p.type === 'hour')?.value ?? '00'}:${parts.find(p => p.type === 'minute')?.value ?? '00'}`;
  const day = (s.business_hours as Hours)?.[String(wd)];
  if (!day?.open) return false;
  return day.from <= day.to ? hm >= day.from && hm < day.to : hm >= day.from || hm < day.to;
}

export async function sendText(instance: string, jid: string, text: string) {
  const number = jid.split('@')[0] ?? jid;
  // Evolution v2: POST /message/sendText/:instance { number, text }
  return evolution(`/message/sendText/${instance}`, { method: 'POST', body: JSON.stringify({ number, text }) });
}

/** Pushes store-level behaviour flags to Evolution (POST /settings/set/:instance). */
export async function applyEvolutionSettings(instance: string, s: Pick<WaSettings, 'ignore_groups' | 'read_messages' | 'reject_calls'>) {
  return evolution(`/settings/set/${instance}`, { method: 'POST', body: JSON.stringify({ rejectCall: s.reject_calls, msgCall: s.reject_calls ? 'لا نستقبل المكالمات حاليًا، يرجى مراسلتنا كتابيًا.' : '', groupsIgnore: s.ignore_groups, alwaysOnline: false, readMessages: s.read_messages, readStatus: false, syncFullHistory: false }) });
}

const TONES: Record<string, string> = { friendly: 'ودود ودافئ', formal: 'رسمي ومهني', concise: 'مختصر ومباشر', sales: 'تسويقي مقنع يبرز مزايا المنتجات' };
const LANGS: Record<string, string> = { auto: 'رد بنفس لغة العميل', ar: 'رد دائمًا بالعربية', en: 'Always reply in English', ar_en: 'رد بالعربية ثم أضف ترجمة إنجليزية مختصرة' };

class AiError extends Error { constructor(msg: string, public status: number) { super(msg); } }

/** Generates a reply through the Lovable AI Gateway (Responses API, streamed). */
export async function generateReply(clientId: string, s: WaSettings, history: { role: 'user' | 'assistant'; text: string }[]) {
  const apiKey = process.env['LOVABLE_API_KEY'];
  if (!apiKey) throw new AiError('مفتاح الذكاء الاصطناعي غير مُعدّ على الخادم', 401);
  const [{ data: client }, { data: products }] = await Promise.all([
    supabaseAdmin.from('clients').select('name').eq('id', clientId).maybeSingle(),
    supabaseAdmin.from('products').select('name, price, currency, description').eq('client_id', clientId).limit(30),
  ]);
  const catalog = (products ?? []).map(p => `- ${p.name}: ${p.price} ${p.currency}${p.description ? ` — ${p.description.slice(0, 120)}` : ''}`).join('\n');
  const instructions = [
    `أنت مساعد خدمة العملاء لمتجر «${client?.name ?? 'المتجر'}» على واتساب.`,
    `الأسلوب: ${TONES[s.ai_tone] ?? TONES['friendly']}. اللغة: ${LANGS[s.ai_language] ?? LANGS['auto']}.`,
    'اجعل الرد قصيرًا ومناسبًا لواتساب، ولا تخترع أسعارًا أو معلومات غير موجودة. إن لم تعرف الإجابة اطلب من العميل انتظار موظف.',
    s.ai_instructions ? `تعليمات المتجر:\n${s.ai_instructions}` : '',
    catalog ? `منتجات المتجر:\n${catalog}` : '',
  ].filter(Boolean).join('\n\n');
  const input = history.map(h => ({ role: h.role, content: h.text }));
  const res = await fetch(`${AI_BASE}/v1/responses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Lovable-API-Key': apiKey, 'X-Lovable-AIG-SDK': 'fetch' },
    body: JSON.stringify({ model: AI_MODEL, instructions, input, stream: true, store: false, reasoning: { effort: 'low', summary: 'auto' }, include: ['reasoning.encrypted_content'] }),
  });
  if (!res.ok || !res.body) {
    const t = await res.text().catch(() => '');
    let msg = t; try { msg = JSON.parse(t)?.message ?? JSON.parse(t)?.error?.message ?? t; } catch { /* keep text */ }
    throw new AiError(`خدمة الذكاء الاصطناعي (${res.status}): ${String(msg).slice(0, 200)}`, res.status);
  }
  const reader = res.body.getReader(); const dec = new TextDecoder();
  let buf = '', out = '';
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    buf += dec.decode(value, { stream: true });
    let i;
    while ((i = buf.indexOf('\n')) >= 0) {
      const line = buf.slice(0, i).trim(); buf = buf.slice(i + 1);
      if (!line.startsWith('data:')) continue;
      const d = line.slice(5).trim(); if (!d || d === '[DONE]') continue;
      try {
        const ev = JSON.parse(d);
        if (ev.type === 'response.output_text.delta' && typeof ev.delta === 'string') out += ev.delta;
        else if (ev.type === 'response.failed' || ev.type === 'error') throw new AiError(ev.response?.error?.message ?? ev.message ?? 'فشل توليد الرد', 500);
      } catch (e) { if (e instanceof AiError) throw e; }
    }
  }
  return out.trim() || null;
}

/** Runs the auto-reply rules for one inbound WhatsApp message. Never throws. */
export async function handleInbound(p: { clientId: string; instance: string; conversationId: string; isNew: boolean; jid: string; text: string | null }) {
  try {
    const s = await loadSettings(p.clientId);
    if (!s) return;
    const { data: conv } = await supabaseAdmin.from('conversations').select('ai_paused, ai_reply_count, away_sent_at').eq('id', p.conversationId).eq('client_id', p.clientId).single();
    if (!conv) return;
    if (p.isNew && s.welcome_enabled && s.welcome_message) await sendText(p.instance, p.jid, s.welcome_message);
    if (conv.ai_paused) return;
    const inHours = withinHours(s);
    const aiAllowed = s.ai_enabled && (s.ai_reply_mode === 'always' || (s.ai_reply_mode === 'business_hours' ? inHours : !inHours));
    if (!inHours && !aiAllowed) {
      const last = conv.away_sent_at ? new Date(conv.away_sent_at).getTime() : 0;
      if (Date.now() - last > 6 * 3600_000) {
        await sendText(p.instance, p.jid, s.outside_hours_message);
        await supabaseAdmin.from('conversations').update({ away_sent_at: new Date().toISOString() }).eq('id', p.conversationId);
      }
      return;
    }
    if (!aiAllowed || !p.text) return;
    const lower = p.text.toLowerCase();
    const handoff = s.handoff_keywords.some(k => k && lower.includes(k.toLowerCase())) || conv.ai_reply_count >= s.max_ai_replies;
    if (handoff) {
      await supabaseAdmin.from('conversations').update({ ai_paused: true }).eq('id', p.conversationId);
      await sendText(p.instance, p.jid, s.handoff_message);
      await notify(p.clientId, 'info', 'محادثة تحتاج موظفًا', `طلب العميل ${p.jid.split('@')[0]} التحدث مع موظف.`);
      return;
    }
    const { data: msgs } = await supabaseAdmin.from('messages').select('direction, body').eq('conversation_id', p.conversationId).eq('client_id', p.clientId).not('body', 'is', null).order('sent_at', { ascending: false }).limit(12);
    const history = (msgs ?? []).reverse().map(m => ({ role: m.direction === 'inbound' ? 'user' as const : 'assistant' as const, text: m.body ?? '' }));
    if (!history.length || history[history.length - 1]?.role !== 'user') history.push({ role: 'user', text: p.text });
    let reply: string | null = null;
    try { reply = await generateReply(p.clientId, s, history); }
    catch (e) { await notify(p.clientId, 'error', 'تعذر توليد رد آلي', (e as Error).message); }
    await sendText(p.instance, p.jid, reply ?? s.unavailable_message);
    if (reply) await supabaseAdmin.from('conversations').update({ ai_reply_count: conv.ai_reply_count + 1 }).eq('id', p.conversationId);
  } catch (e) {
    await notify(p.clientId, 'error', 'خطأ في الرد الآلي', (e as Error).message).catch(() => null);
  }
}
