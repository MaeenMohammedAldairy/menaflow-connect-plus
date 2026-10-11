import { createFileRoute, Link } from '@tanstack/react-router';
import { useServerFn } from '@tanstack/react-start';
import { useEffect, useState, type FormEvent } from 'react';
import { z } from 'zod';
import { Loader2, RefreshCw, Save, Unplug } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { PageHeader } from '@/components/page-header';
import { AppNav } from '@/components/app-nav';
import { useAccount } from '@/components/account-provider';
import { pageHead } from '@/lib/page-head';
import { disconnectPlatform, whatsappRefresh, type ConnectionView } from '@/lib/channels.functions';
import { getWhatsappSettings, saveWhatsappSettings, whatsappReconnect, listWhatsappConversations, setConversationAi, listNotifications, settingsSchema, defaultSettings, type WhatsappSettingsInput } from '@/lib/whatsapp-settings.functions';

export const Route = createFileRoute('/settings_/whatsapp')({
  validateSearch: z.object({ connected: z.boolean().optional() }),
  head: () => pageHead('إعدادات واتساب', 'إدارة اتصال واتساب والرد الآلي وساعات العمل والإشعارات في MenaFlow.'),
  component: WhatsappSettings,
});

const DAYS = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
type Conv = Awaited<ReturnType<typeof listWhatsappConversations>>[number];
type Note = Awaited<ReturnType<typeof listNotifications>>[number];

function WhatsappSettings() {
  const { user, loading } = useAccount();
  const { connected: justConnected } = Route.useSearch();
  const load = useServerFn(getWhatsappSettings), save = useServerFn(saveWhatsappSettings), refresh = useServerFn(whatsappRefresh);
  const reconnect = useServerFn(whatsappReconnect), disconnect = useServerFn(disconnectPlatform);
  const convs = useServerFn(listWhatsappConversations), toggleAi = useServerFn(setConversationAi), notes = useServerFn(listNotifications);
  const [s, setS] = useState<WhatsappSettingsInput>(defaultSettings);
  const [conn, setConn] = useState<ConnectionView>(null);
  const [list, setList] = useState<Conv[]>([]); const [alerts, setAlerts] = useState<Note[]>([]);
  const [canEdit, setCanEdit] = useState(false); const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(''); const [notice, setNotice] = useState<{ ok: boolean; text: string } | null>(justConnected ? { ok: true, text: 'تم ربط واتساب بنجاح.' } : null);
  const [keywords, setKeywords] = useState('');

  useEffect(() => {
    if (!user) return;
    Promise.all([load(), refresh(), convs().catch(() => []), notes().catch(() => [])]).then(([r, c, l, n]) => {
      setS(r.settings); setKeywords(r.settings.handoff_keywords.join('، ')); setCanEdit(r.canEdit); setConn(c ?? null); setList(l); setAlerts(n);
    }).catch(e => setNotice({ ok: false, text: (e as Error).message })).finally(() => setReady(true));
  }, [user, load, refresh, convs, notes]);

  const set = <K extends keyof WhatsappSettingsInput>(k: K, v: WhatsappSettingsInput[K]) => setS(p => ({ ...p, [k]: v }));
  async function submit(e: FormEvent) {
    e.preventDefault(); setNotice(null);
    const data = { ...s, handoff_keywords: keywords.split(/[،,]/).map(k => k.trim()).filter(Boolean) };
    const v = settingsSchema.safeParse(data);
    if (!v.success) { setNotice({ ok: false, text: v.error.issues[0]?.message ?? 'تحقق من المدخلات' }); return; }
    setBusy('save');
    try { const r = await save({ data: v.data }); setNotice({ ok: r.serverSync !== 'failed', text: r.serverSync === 'failed' ? `حُفظت الإعدادات، لكن تعذر تطبيقها على خادم واتساب: ${r.syncError}` : 'تم حفظ الإعدادات بنجاح.' }); }
    catch (err) { setNotice({ ok: false, text: (err as Error).message || 'تعذر الحفظ' }); } finally { setBusy(''); }
  }
  async function act(name: string, fn: () => Promise<unknown>, ok: string) {
    setBusy(name); setNotice(null);
    try { await fn(); setConn((await refresh()) ?? null); setNotice({ ok: true, text: ok }); }
    catch (err) { setNotice({ ok: false, text: (err as Error).message }); } finally { setBusy(''); }
  }

  if (loading || (user && !ready)) return <main className="dashboard-shell"><PageHeader /><p role="status"><Loader2 className="animate-spin" /> جارٍ التحميل…</p></main>;
  if (!user) return <main className="dashboard-shell"><PageHeader /><section className="empty-state"><h2>سجّل الدخول لإدارة واتساب</h2><Button variant="dashboard" asChild><Link to="/auth">تسجيل الدخول</Link></Button></section></main>;
  const connected = conn?.status === 'connected';
  const field = (label: string, k: 'welcome_message' | 'unavailable_message' | 'closing_message' | 'outside_hours_message' | 'handoff_message') => <label className="field-label">{label}<textarea className="plain-input" rows={2} maxLength={1000} value={s[k]} onChange={e => set(k, e.target.value)} disabled={!canEdit} /></label>;
  const toggle = (label: string, k: 'ai_enabled' | 'hours_enabled' | 'welcome_enabled' | 'ignore_groups' | 'read_messages' | 'reject_calls' | 'notify_new_message' | 'notify_disconnect' | 'notify_errors') => <div className="setting-row"><h3>{label}</h3><Switch checked={s[k]} onCheckedChange={v => set(k, v)} disabled={!canEdit} aria-label={label} /></div>;

  return <main className="dashboard-shell" dir="rtl"><PageHeader />
    <div className="page-title"><span className="eyebrow">MenaFlow</span><h1>إعدادات واتساب</h1></div>
    {notice && <p role={notice.ok ? 'status' : 'alert'} className={notice.ok ? 'wa-connected' : 'wa-alert'}>{notice.text}</p>}
    {!canEdit && <p className="wa-warn">يمكنك عرض الإعدادات فقط؛ التعديل لمالك المتجر أو المدير.</p>}
    <form onSubmit={submit} className="settings-layout">
      <section className="settings-section"><h2>معلومات الاتصال</h2>
        <div className="setting-row"><h3>الرقم المرتبط</h3><span dir="ltr">{conn?.phone_number ? `+${conn.phone_number}` : '—'}</span></div>
        <div className="setting-row"><h3>الحالة</h3><span>{connected ? 'متصل' : conn?.status === 'pending' ? 'قيد الربط' : 'غير متصل'}</span></div>
        <div className="setting-row"><h3>آخر اتصال</h3><span>{conn?.verified_at ? new Date(conn.verified_at).toLocaleString('ar') : '—'}</span></div>
        {conn?.error && <p className="wa-alert">{conn.error}</p>}
        <div className="wa-actions">
          {conn ? <Button type="button" variant="outline" disabled={!canEdit || !!busy} onClick={() => act('re', () => reconnect(), 'تمت إعادة الاتصال.')}>{busy === 're' ? <Loader2 className="animate-spin" /> : <RefreshCw />}إعادة الاتصال</Button> : <Button variant="dashboard" asChild><Link to="/connect/whatsapp">ربط واتساب</Link></Button>}
          {conn && conn.status !== 'disconnected' && <Button type="button" variant="outline" disabled={!canEdit || !!busy} onClick={() => window.confirm('فصل واتساب عن المتجر؟') && act('dc', () => disconnect({ data: { platform: 'whatsapp' } }), 'تم فصل الحساب.')}><Unplug />فصل الحساب</Button>}
          {conn?.status === 'disconnected' && <Button variant="dashboard" asChild><Link to="/connect/whatsapp">ربط من جديد</Link></Button>}
        </div>
      </section>
      <section className="settings-section"><h2>الرد التلقائي بالذكاء الاصطناعي</h2>
        {toggle('تفعيل الرد الآلي', 'ai_enabled')}
        <label className="field-label">أسلوب الرد<select className="plain-input" value={s.ai_tone} onChange={e => set('ai_tone', e.target.value as never)} disabled={!canEdit}><option value="friendly">ودود</option><option value="formal">رسمي</option><option value="concise">مختصر</option><option value="sales">تسويقي</option></select></label>
        <label className="field-label">لغة المحادثة<select className="plain-input" value={s.ai_language} onChange={e => set('ai_language', e.target.value as never)} disabled={!canEdit}><option value="auto">حسب لغة العميل</option><option value="ar">العربية</option><option value="en">الإنجليزية</option><option value="ar_en">عربي + إنجليزي</option></select></label>
        <label className="field-label">تعليمات المتجر<textarea className="plain-input" rows={4} maxLength={4000} value={s.ai_instructions} onChange={e => set('ai_instructions', e.target.value)} disabled={!canEdit} /></label>
      </section>
      <section className="settings-section"><h2>ساعات العمل</h2>
        {toggle('تفعيل ساعات العمل', 'hours_enabled')}
        <label className="field-label">المنطقة الزمنية<input className="plain-input" dir="ltr" value={s.timezone} onChange={e => set('timezone', e.target.value)} disabled={!canEdit} /></label>
        {DAYS.map((d, i) => { const k = String(i) as keyof WhatsappSettingsInput['business_hours']; const h = s.business_hours[k] ?? { open: false, from: '09:00', to: '17:00' };
          const upd = (p: Partial<typeof h>) => set('business_hours', { ...s.business_hours, [k]: { ...h, ...p } });
          return <div className="setting-row" key={d}><h3><Switch checked={h.open} onCheckedChange={v => upd({ open: v })} disabled={!canEdit} aria-label={d} />{d}</h3><span dir="ltr" className="flex gap-2"><input type="time" className="plain-input" value={h.from} onChange={e => upd({ from: e.target.value })} disabled={!canEdit || !h.open} /><input type="time" className="plain-input" value={h.to} onChange={e => upd({ to: e.target.value })} disabled={!canEdit || !h.open} /></span></div>; })}
        {field('رسالة خارج أوقات العمل', 'outside_hours_message')}
      </section>
      <section className="settings-section"><h2>إعدادات الرسائل</h2>
        {toggle('إرسال رسالة ترحيب', 'welcome_enabled')}
        {field('رسالة الترحيب', 'welcome_message')}{field('رسالة عدم التوفر', 'unavailable_message')}{field('رسالة إنهاء المحادثة', 'closing_message')}
      </section>
      <section className="settings-section"><h2>التحكم في الردود</h2>
        <label className="field-label">متى يرد الذكاء الاصطناعي<select className="plain-input" value={s.ai_reply_mode} onChange={e => set('ai_reply_mode', e.target.value as never)} disabled={!canEdit}><option value="always">دائمًا</option><option value="business_hours">داخل أوقات العمل</option><option value="outside_hours">خارج أوقات العمل</option></select></label>
        <label className="field-label">كلمات التحويل لموظف (افصل بفاصلة)<input className="plain-input" value={keywords} onChange={e => setKeywords(e.target.value)} disabled={!canEdit} /></label>
        <label className="field-label">أقصى عدد ردود آلية قبل التحويل<input type="number" min={1} max={200} className="plain-input" value={s.max_ai_replies} onChange={e => set('max_ai_replies', Number(e.target.value))} disabled={!canEdit} /></label>
        {field('رسالة التحويل إلى موظف', 'handoff_message')}
        {toggle('تجاهل المجموعات', 'ignore_groups')}{toggle('قراءة الرسائل تلقائيًا', 'read_messages')}{toggle('رفض المكالمات', 'reject_calls')}
        <h3>المحادثات</h3>
        {list.length === 0 ? <p className="wa-muted">لا توجد محادثات بعد.</p> : list.map(c => <div className="setting-row" key={c.id}><div><h3 dir="auto">{c.subject ?? c.external_thread_id?.split('@')[0]}</h3><p>{c.last_message_preview}</p></div>
          <Switch checked={!c.ai_paused} aria-label="الرد الآلي لهذه المحادثة" onCheckedChange={async v => { try { await toggleAi({ data: { conversationId: c.id, paused: !v } }); setList(l => l.map(x => x.id === c.id ? { ...x, ai_paused: !v } : x)); } catch (e) { setNotice({ ok: false, text: (e as Error).message }); } }} /></div>)}
      </section>
      <section className="settings-section"><h2>الإشعارات</h2>
        {toggle('رسائل جديدة', 'notify_new_message')}{toggle('انقطاع الاتصال', 'notify_disconnect')}{toggle('الأخطاء', 'notify_errors')}
        {alerts.map(n => <div className="setting-row" key={n.id}><div><h3>{n.title}</h3><p>{n.body}</p></div><small>{new Date(n.created_at).toLocaleString('ar')}</small></div>)}
      </section>
      {canEdit && <Button type="submit" variant="dashboard" disabled={!!busy}>{busy === 'save' ? <Loader2 className="animate-spin" /> : <Save />}حفظ الإعدادات</Button>}
    </form>
    <AppNav active="الإعدادات" /></main>;
}
