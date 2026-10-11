import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';

const time = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'صيغة الوقت غير صحيحة');
const day = z.object({ open: z.boolean(), from: time, to: time });
const msg = (label: string) => z.string().trim().min(1, `${label} مطلوبة`).max(1000, `${label} أطول من 1000 حرف`);

export const settingsSchema = z.object({
  ai_enabled: z.boolean(),
  ai_tone: z.enum(['friendly', 'formal', 'concise', 'sales']),
  ai_language: z.enum(['auto', 'ar', 'en', 'ar_en']),
  ai_instructions: z.string().max(4000, 'التعليمات أطول من 4000 حرف'),
  ai_reply_mode: z.enum(['always', 'business_hours', 'outside_hours']),
  handoff_keywords: z.array(z.string().trim().min(1).max(40)).max(30, 'الحد الأقصى 30 كلمة'),
  handoff_message: msg('رسالة التحويل'),
  max_ai_replies: z.number().int().min(1, 'الحد الأدنى 1').max(200, 'الحد الأقصى 200'),
  hours_enabled: z.boolean(),
  timezone: z.string().min(1).max(64).refine(tz => { try { new Intl.DateTimeFormat('en', { timeZone: tz }); return true; } catch { return false; } }, 'المنطقة الزمنية غير صالحة'),
  business_hours: z.record(z.enum(['0', '1', '2', '3', '4', '5', '6']), day),
  outside_hours_message: msg('رسالة خارج أوقات العمل'),
  welcome_enabled: z.boolean(),
  welcome_message: msg('رسالة الترحيب'),
  unavailable_message: msg('رسالة عدم التوفر'),
  closing_message: msg('رسالة إنهاء المحادثة'),
  ignore_groups: z.boolean(),
  read_messages: z.boolean(),
  reject_calls: z.boolean(),
  notify_new_message: z.boolean(),
  notify_disconnect: z.boolean(),
  notify_errors: z.boolean(),
});
export type WhatsappSettingsInput = z.infer<typeof settingsSchema>;

const defaultHours = Object.fromEntries(['0', '1', '2', '3', '4', '5', '6'].map(d => [d, { open: d !== '5', from: '09:00', to: '17:00' }]));
export const defaultSettings: WhatsappSettingsInput = {
  ai_enabled: false, ai_tone: 'friendly', ai_language: 'auto', ai_instructions: '', ai_reply_mode: 'always',
  handoff_keywords: ['موظف', 'بشري', 'agent', 'human'], handoff_message: 'تم تحويل محادثتك إلى أحد موظفينا وسيتواصل معك قريبًا.', max_ai_replies: 20,
  hours_enabled: false, timezone: 'Asia/Aden', business_hours: defaultHours as WhatsappSettingsInput['business_hours'],
  outside_hours_message: 'شكرًا لتواصلك! نحن خارج أوقات العمل حاليًا وسنرد عليك فور عودتنا.',
  welcome_enabled: true, welcome_message: 'أهلًا بك! كيف يمكننا مساعدتك اليوم؟', unavailable_message: 'عذرًا، لا يمكننا الرد حاليًا. سنعود إليك قريبًا.',
  closing_message: 'شكرًا لتواصلك معنا! نتمنى لك يومًا سعيدًا.', ignore_groups: true, read_messages: false, reject_calls: false,
  notify_new_message: true, notify_disconnect: true, notify_errors: true,
};

async function clientOf(userId: string, email?: string) {
  const { ensureClientForUser } = await import('./channels.server');
  return ensureClientForUser(userId, email);
}
type Ctx = { supabase: any; userId: string; claims: any };
async function requireEditor(c: Ctx) {
  const clientId = await clientOf(c.userId, c.claims?.email);
  const { data: ok } = await c.supabase.rpc('has_client_role', { p_client_id: clientId, p_roles: ['owner', 'admin'] });
  if (!ok) throw new Error('لا تملك صلاحية تعديل إعدادات هذا المتجر');
  return clientId;
}
async function myInstance(c: Ctx, clientId: string) {
  const { data } = await c.supabase.from('platform_connections').select('id, instance_name, status').eq('client_id', clientId).eq('platform', 'whatsapp').maybeSingle();
  return data as { id: string; instance_name: string | null; status: string } | null;
}

export const getWhatsappSettings = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const clientId = await clientOf(context.userId, context.claims?.email as string | undefined);
    const [{ data: row, error }, { data: canEdit }] = await Promise.all([
      context.supabase.from('whatsapp_settings').select('*').eq('client_id', clientId).maybeSingle(),
      context.supabase.rpc('has_client_role', { p_client_id: clientId, p_roles: ['owner', 'admin'] }),
    ]);
    if (error) throw new Error('تعذر تحميل إعدادات واتساب');
    const settings = { ...defaultSettings } as WhatsappSettingsInput;
    if (row) for (const k of Object.keys(defaultSettings) as (keyof WhatsappSettingsInput)[]) (settings as any)[k] = (row as any)[k] ?? (defaultSettings as any)[k];
    return { settings, saved: !!row, updatedAt: row?.updated_at ?? null, canEdit: !!canEdit, aiConfigured: !!process.env['LOVABLE_API_KEY'] };
  });

export const saveWhatsappSettings = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => settingsSchema.parse(d))
  .handler(async ({ data, context }) => {
    const clientId = await requireEditor(context);
    const { data: row, error } = await context.supabase.from('whatsapp_settings')
      .upsert({ ...data, client_id: clientId, updated_by: context.userId, updated_at: new Date().toISOString() }, { onConflict: 'client_id' })
      .select('updated_at').single();
    if (error) throw new Error('تعذر حفظ الإعدادات في قاعدة البيانات');
    let serverSync: 'ok' | 'skipped' | 'failed' = 'skipped'; let syncError: string | null = null;
    const inst = await myInstance(context, clientId);
    if (inst?.instance_name && inst.status === 'connected') {
      const { applyEvolutionSettings } = await import('./whatsapp-bot.server');
      try { await applyEvolutionSettings(inst.instance_name, data); serverSync = 'ok'; }
      catch (e) { serverSync = 'failed'; syncError = (e as Error).message; }
    }
    return { updatedAt: row.updated_at, serverSync, syncError };
  });

/** Restarts the Evolution session (POST /instance/restart/:name) and re-reads its live state. */
export const whatsappReconnect = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const clientId = await requireEditor(context);
    const inst = await myInstance(context, clientId);
    if (!inst?.instance_name) throw new Error('لا يوجد حساب واتساب مرتبط. اربط الحساب أولًا.');
    const { evolution } = await import('./channels.server');
    try { await evolution(`/instance/restart/${inst.instance_name}`, { method: 'POST' }); }
    catch (e) {
      if ((e as { status?: number }).status === 404) throw new Error('الجلسة غير موجودة على خادم واتساب. افصل الحساب وأعد الربط.');
      await evolution(`/instance/restart/${inst.instance_name}`, { method: 'PUT' });
    }
    return { ok: true };
  });

export const listWhatsappConversations = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const clientId = await clientOf(context.userId, context.claims?.email as string | undefined);
    const { data, error } = await context.supabase.from('conversations').select('id, subject, external_thread_id, last_message_at, last_message_preview, ai_paused, status')
      .eq('client_id', clientId).eq('platform', 'whatsapp').order('last_message_at', { ascending: false, nullsFirst: false }).limit(50);
    if (error) throw new Error('تعذر تحميل المحادثات');
    return data ?? [];
  });

export const setConversationAi = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ conversationId: z.string().uuid(), paused: z.boolean() }).parse(d))
  .handler(async ({ data, context }) => {
    const clientId = await clientOf(context.userId, context.claims?.email as string | undefined);
    const { data: row, error } = await context.supabase.from('conversations')
      .update({ ai_paused: data.paused, ...(data.paused ? {} : { ai_reply_count: 0 }) })
      .eq('id', data.conversationId).eq('client_id', clientId).select('id').maybeSingle();
    if (error || !row) throw new Error('تعذر تحديث المحادثة');
    return { ok: true };
  });

/** Sends the closing message to a conversation and marks it closed. */
export const closeConversation = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ conversationId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const clientId = await clientOf(context.userId, context.claims?.email as string | undefined);
    const { data: conv } = await context.supabase.from('conversations').select('id, external_thread_id').eq('id', data.conversationId).eq('client_id', clientId).maybeSingle();
    if (!conv?.external_thread_id) throw new Error('المحادثة غير موجودة');
    const inst = await myInstance(context, clientId);
    if (!inst?.instance_name || inst.status !== 'connected') throw new Error('واتساب غير متصل حاليًا');
    const { loadSettings, sendText } = await import('./whatsapp-bot.server');
    const s = await loadSettings(clientId);
    await sendText(inst.instance_name, conv.external_thread_id, s?.closing_message ?? defaultSettings.closing_message);
    await context.supabase.from('conversations').update({ status: 'closed', ai_reply_count: 0 }).eq('id', conv.id).eq('client_id', clientId);
    return { ok: true };
  });

/** Generates a sample AI reply from the saved settings without sending anything. */
export const testAiReply = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ message: z.string().trim().min(1, 'اكتب رسالة للتجربة').max(500) }).parse(d))
  .handler(async ({ data, context }) => {
    const clientId = await requireEditor(context);
    const { loadSettings, generateReply } = await import('./whatsapp-bot.server');
    const s = await loadSettings(clientId);
    if (!s) throw new Error('احفظ الإعدادات أولًا ثم جرّب الرد');
    const reply = await generateReply(clientId, s, [{ role: 'user', text: data.message }]);
    if (!reply) throw new Error('لم يُرجِع الذكاء الاصطناعي ردًا');
    return { reply };
  });

export const listNotifications = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const clientId = await clientOf(context.userId, context.claims?.email as string | undefined);
    const { data, error } = await context.supabase.from('client_notifications').select('id, kind, title, body, read_at, created_at').eq('client_id', clientId).eq('platform', 'whatsapp').order('created_at', { ascending: false }).limit(20);
    if (error) throw new Error('تعذر تحميل الإشعارات');
    return data ?? [];
  });

export const markNotificationsRead = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const clientId = await clientOf(context.userId, context.claims?.email as string | undefined);
    const { error } = await context.supabase.from('client_notifications').update({ read_at: new Date().toISOString() }).eq('client_id', clientId).is('read_at', null);
    if (error) throw new Error('تعذر تحديث الإشعارات');
    return { ok: true };
  });
