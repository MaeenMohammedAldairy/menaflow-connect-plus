import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';

const platformSchema = z.enum(['whatsapp', 'facebook', 'instagram']);
const originSchema = z.string().url().max(200);

export type ConnectionView = { platform: 'whatsapp' | 'facebook' | 'instagram'; status: 'pending' | 'connected' | 'disconnected' | 'error'; account_name: string; phone_number: string | null; error: string | null; qr_code: string | null; pairing_code: string | null; pairing_phone: string | null; qr_expires_at: string | null; verified_at: string | null; updated_at: string } | null;

const cols = 'platform, status, account_name, phone_number, error, qr_code, pairing_code, pairing_phone, qr_expires_at, verified_at, updated_at';

async function ctx(userId: string, email?: string | null) {
  const { ensureClientForUser } = await import('./channels.server');
  return ensureClientForUser(userId, email);
}

export const getConnection = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ platform: platformSchema }).parse(d))
  .handler(async ({ data, context }): Promise<ConnectionView> => {
    const { data: row } = await context.supabase.from('platform_connections').select(cols).eq('platform', data.platform).order('updated_at', { ascending: false }).limit(1).maybeSingle();
    return (row as ConnectionView) ?? null;
  });

const phoneSchema = z.string().trim().regex(/^\+?[0-9]{8,15}$/, 'رقم الهاتف غير صالح');
const PAIRING_TTL_MS = 60_000;

type Evo = (path: string, init?: RequestInit) => Promise<any>;

/** Reads the live state from Evolution (GET /instance/connectionState/:name → { instance: { state } }). */
async function liveState(evolution: Evo, instanceName: string): Promise<string | null> {
  const s = await evolution(`/instance/connectionState/${instanceName}`);
  return s?.instance?.state ?? s?.state ?? null;
}
/** Reads the paired phone from Evolution (GET /instance/fetchInstances?instanceName= → [{ ownerJid, profileName }]). */
async function ownerPhone(evolution: Evo, instanceName: string): Promise<{ phone: string | null; name: string | null }> {
  const list = await evolution(`/instance/fetchInstances?instanceName=${encodeURIComponent(instanceName)}`).catch(() => null);
  const item = Array.isArray(list) ? list[0] : list;
  const jid: string | undefined = item?.ownerJid ?? item?.instance?.owner;
  return { phone: jid ? (jid.split('@')[0] ?? '').split(':')[0] ?? null : null, name: item?.profileName ?? item?.instance?.profileName ?? null };
}

/** Checks the Evolution server is reachable and reports its version (GET / → { status, version }). */
export const whatsappServerInfo = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .handler(async () => {
    const { evolution } = await import('./channels.server');
    try {
      const info = await evolution('/');
      const version = typeof info?.version === 'string' ? info.version : null;
      return { ok: true, version, compatible: version ? /^2\.(3|[4-9])\./.test(version) : false };
    } catch (e) { return { ok: false, version: null, compatible: false, error: (e as Error).message }; }
  });

/** WhatsApp: create (or reuse) this store's Evolution instance and request a pairing code for the phone. */
export const whatsappRequestPairing = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ origin: originSchema, phone: phoneSchema }).parse(d))
  .handler(async ({ data, context }): Promise<ConnectionView> => {
    const { evolution, allowedOrigin, randomToken } = await import('./channels.server');
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
    const origin = allowedOrigin(data.origin);
    if (!origin) throw new Error('عنوان التطبيق غير مسموح');
    const phone = data.phone.replace(/\D/g, '');
    const clientId = await ctx(context.userId, context.claims?.email as string | undefined);
    const instanceName = `mf_${clientId.replace(/-/g, '')}`;
    const { data: conn, error } = await supabaseAdmin.from('platform_connections').upsert({ client_id: clientId, user_id: context.userId, platform: 'whatsapp', account_name: 'واتساب', provider_account_id: instanceName, instance_name: instanceName, status: 'pending', error: null, revoked_at: null, verified_at: null, pairing_code: null, pairing_phone: phone, qr_code: null }, { onConflict: 'client_id,platform' }).select('id').single();
    if (error || !conn) throw new Error('تعذر حفظ الاتصال');
    const { data: sec } = await supabaseAdmin.from('connection_secrets').select('webhook_token').eq('connection_id', conn.id).maybeSingle();
    const token = sec?.webhook_token ?? randomToken();
    await supabaseAdmin.from('connection_secrets').upsert({ connection_id: conn.id, client_id: clientId, webhook_token: token, updated_at: new Date().toISOString() });
    const webhook = { url: `${origin}/api/public/evolution/webhook?token=${token}`, byEvents: false, base64: false, events: ['CONNECTION_UPDATE', 'MESSAGES_UPSERT'] };
    const fail = async (msg: string) => { await supabaseAdmin.from('platform_connections').update({ status: 'error', error: msg, pairing_code: null }).eq('id', conn.id); throw new Error(msg); };
    try {
      // POST /instance/create (v2): number + qrcode lets Baileys issue a pairing code.
      await evolution('/instance/create', { method: 'POST', body: JSON.stringify({ instanceName, integration: 'WHATSAPP-BAILEYS', qrcode: true, number: phone, webhook }) });
    } catch (e) {
      const status = (e as { status?: number }).status;
      if (status !== 403 && status !== 409 && status !== 400) await fail((e as Error).message);
      await evolution(`/webhook/set/${instanceName}`, { method: 'POST', body: JSON.stringify({ webhook: { enabled: true, ...webhook } }) }).catch(() => null);
    }
    try {
      const state = await liveState(evolution, instanceName);
      if (state === 'open') {
        const owner = await ownerPhone(evolution, instanceName);
        if (owner.phone && owner.phone !== phone) {
          await fail(`هذا المتجر مرتبط حاليًا بالرقم +${owner.phone}. افصل الحساب أولًا ثم أعد المحاولة.`);
        }
        await supabaseAdmin.from('platform_connections').update({ status: 'connected', pairing_code: null, error: null, verified_at: new Date().toISOString(), phone_number: owner.phone, account_name: owner.phone ? `+${owner.phone}` : 'واتساب' }).eq('id', conn.id);
      } else {
        // GET /instance/connect/:name?number= → { pairingCode, code, count }
        const c = await evolution(`/instance/connect/${instanceName}?number=${phone}`);
        const code: string | null = typeof c?.pairingCode === 'string' && c.pairingCode ? c.pairingCode : null;
        if (!code) await fail('لم يُرجِع خادم واتساب رمز الربط. تأكد من صحة الرقم وأعد المحاولة.');
        await supabaseAdmin.from('platform_connections').update({ pairing_code: code, qr_expires_at: new Date(Date.now() + PAIRING_TTL_MS).toISOString() }).eq('id', conn.id);
      }
    } catch (e) {
      const { data: cur } = await supabaseAdmin.from('platform_connections').select('status').eq('id', conn.id).single();
      if (cur?.status !== 'error') await fail((e as Error).message || 'تعذر طلب رمز الربط');
      throw e;
    }
    const { data: row } = await supabaseAdmin.from('platform_connections').select(cols).eq('id', conn.id).single();
    return row as ConnectionView;
  });

/** WhatsApp: poll live state from Evolution; "connected" is only stored after Evolution reports state=open. */
export const whatsappRefresh = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<ConnectionView> => {
    const { evolution } = await import('./channels.server');
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
    const { data: mine } = await context.supabase.from('platform_connections').select('id, instance_name, status, pairing_phone').eq('platform', 'whatsapp').limit(1).maybeSingle();
    if (!mine?.instance_name) return null;
    try {
      const state = await liveState(evolution, mine.instance_name);
      if (state === 'open') {
        const owner = await ownerPhone(evolution, mine.instance_name);
        await supabaseAdmin.from('platform_connections').update({ status: 'connected', pairing_code: null, qr_code: null, error: null, verified_at: new Date().toISOString(), revoked_at: null, ...(owner.phone ? { phone_number: owner.phone, account_name: `+${owner.phone}` } : {}) }).eq('id', mine.id);
      } else if (mine.status === 'connected') {
        await supabaseAdmin.from('platform_connections').update({ status: 'disconnected', verified_at: null, error: 'انقطع اتصال واتساب. أعد الربط.' }).eq('id', mine.id);
      }
    } catch (e) {
      if ((e as { status?: number }).status === 404) await supabaseAdmin.from('platform_connections').update({ status: 'disconnected', pairing_code: null, verified_at: null, error: 'الجلسة غير موجودة على الخادم، أعد الربط.' }).eq('id', mine.id);
      else if (mine.status === 'connected') { /* keep last verified state on transient errors */ }
    }
    const { data: row } = await supabaseAdmin.from('platform_connections').select(cols).eq('id', mine.id).single();
    return row as ConnectionView;
  });

/** Disconnect any platform for the caller's client. */
export const disconnectPlatform = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ platform: platformSchema }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
    const { data: mine } = await context.supabase.from('platform_connections').select('id, client_id, instance_name, page_id').eq('platform', data.platform).limit(1).maybeSingle();
    if (!mine) return { ok: true };
    const { data: allowed } = await context.supabase.rpc('has_client_role', { p_client_id: mine.client_id, p_roles: ['owner', 'admin'] });
    if (!allowed) throw new Error('لا تملك صلاحية فصل هذا الحساب');
    if (data.platform === 'whatsapp' && mine.instance_name) {
      const { evolution } = await import('./channels.server');
      await evolution(`/instance/logout/${mine.instance_name}`, { method: 'DELETE' }).catch(() => null);
      await evolution(`/instance/delete/${mine.instance_name}`, { method: 'DELETE' }).catch(() => null);
    } else if (mine.page_id) {
      const { data: sec } = await supabaseAdmin.from('connection_secrets').select('access_token').eq('connection_id', mine.id).maybeSingle();
      if (sec?.access_token) await fetch(`https://graph.facebook.com/v21.0/${mine.page_id}/subscribed_apps?access_token=${encodeURIComponent(sec.access_token)}`, { method: 'DELETE' }).catch(() => null);
    }
    await supabaseAdmin.from('connection_secrets').update({ access_token: null }).eq('connection_id', mine.id);
    await supabaseAdmin.from('platform_connections').update({ status: 'disconnected', qr_code: null, pairing_code: null, verified_at: null, revoked_at: new Date().toISOString(), error: null }).eq('id', mine.id);
    return { ok: true };
  });

/** Meta: build the OAuth dialog URL for Facebook or Instagram. */
export const metaStartOAuth = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ platform: z.enum(['facebook', 'instagram']), origin: originSchema }).parse(d))
  .handler(async ({ data, context }) => {
    const { allowedOrigin, randomToken } = await import('./channels.server');
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
    const appId = process.env['META_APP_ID'];
    if (!appId) throw new Error('تطبيق Meta غير مُعدّ');
    const origin = allowedOrigin(data.origin);
    if (!origin) throw new Error('عنوان التطبيق غير مسموح');
    const clientId = await ctx(context.userId, context.claims?.email as string | undefined);
    const state = randomToken();
    const redirectUri = `${origin}/api/public/meta/callback`;
    await supabaseAdmin.from('oauth_states').insert({ state, user_id: context.userId, client_id: clientId, platform: data.platform, redirect_uri: redirectUri, return_origin: origin });
    const scope = ['pages_show_list', 'pages_messaging', 'pages_manage_metadata', 'pages_read_engagement', 'business_management', ...(data.platform === 'instagram' ? ['instagram_basic', 'instagram_manage_messages'] : [])].join(',');
    const url = `https://www.facebook.com/v21.0/dialog/oauth?client_id=${appId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}&response_type=code&scope=${scope}`;
    return { url };
  });
