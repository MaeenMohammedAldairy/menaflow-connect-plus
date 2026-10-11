import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import { useServerFn } from '@tanstack/react-start';
import { CircleAlert, CircleCheck, Copy, Loader2, RefreshCw, Smartphone, Unplug } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAccount } from '@/components/account-provider';
import { disconnectPlatform, whatsappRefresh, whatsappRequestPairing, whatsappServerInfo, type ConnectionView } from '@/lib/channels.functions';

const COUNTRIES = [
  { code: '967', name: 'اليمن' }, { code: '966', name: 'السعودية' }, { code: '971', name: 'الإمارات' },
  { code: '968', name: 'عُمان' }, { code: '974', name: 'قطر' }, { code: '965', name: 'الكويت' },
  { code: '973', name: 'البحرين' }, { code: '20', name: 'مصر' }, { code: '962', name: 'الأردن' },
  { code: '964', name: 'العراق' }, { code: '963', name: 'سوريا' }, { code: '961', name: 'لبنان' },
  { code: '970', name: 'فلسطين' }, { code: '212', name: 'المغرب' }, { code: '213', name: 'الجزائر' },
  { code: '216', name: 'تونس' }, { code: '218', name: 'ليبيا' }, { code: '249', name: 'السودان' },
  { code: '90', name: 'تركيا' }, { code: '1', name: 'أمريكا/كندا' }, { code: '44', name: 'بريطانيا' },
];

function formatCode(c: string) { const s = c.replace(/[^A-Z0-9]/gi, '').toUpperCase(); return s.length === 8 ? `${s.slice(0, 4)}-${s.slice(4)}` : s; }

export function WhatsappPairing() {
  const { refreshConnections } = useAccount();
  const request = useServerFn(whatsappRequestPairing);
  const refresh = useServerFn(whatsappRefresh);
  const disconnect = useServerFn(disconnectPlatform);
  const info = useServerFn(whatsappServerInfo);
  const [conn, setConn] = useState<ConnectionView>(null);
  const [country, setCountry] = useState('967');
  const [local, setLocal] = useState('');
  const [busy, setBusy] = useState<'' | 'load' | 'request' | 'disconnect' | 'check'>('load');
  const [error, setError] = useState('');
  const [server, setServer] = useState<{ ok: boolean; version: string | null; compatible: boolean; error?: string } | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [copied, setCopied] = useState(false);
  const wasConnected = useRef(false);

  const sync = useCallback(async () => {
    const next = await refresh();
    setConn(next ?? null);
    if (next?.status === 'connected' && !wasConnected.current) void refreshConnections();
    wasConnected.current = next?.status === 'connected';
    return next;
  }, [refresh, refreshConnections]);

  useEffect(() => {
    let active = true;
    Promise.all([sync().catch(() => { if (active) setError('تعذر تحميل حالة الاتصال.'); }), info().then(r => active && setServer(r)).catch(() => null)])
      .finally(() => active && setBusy(''));
    return () => { active = false; };
  }, [sync, info]);

  const pending = conn?.status === 'pending' && !!conn.pairing_code;
  const expiresAt = conn?.qr_expires_at ? new Date(conn.qr_expires_at).getTime() : 0;
  const remaining = Math.max(0, Math.ceil((expiresAt - now) / 1000));
  const expired = pending && remaining === 0;

  // Countdown tick + automatic status polling while waiting, slower check when connected.
  useEffect(() => {
    if (!pending) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [pending]);
  useEffect(() => {
    if (conn?.status !== 'pending' && conn?.status !== 'connected') return;
    const ms = conn.status === 'pending' ? 3000 : 30000;
    const t = setInterval(() => { void sync().catch(() => null); }, ms);
    return () => clearInterval(t);
  }, [conn?.status, sync]);

  useEffect(() => {
    if (conn?.pairing_phone && !local) {
      const c = COUNTRIES.find(x => conn.pairing_phone!.startsWith(x.code));
      if (c) { setCountry(c.code); setLocal(conn.pairing_phone.slice(c.code.length)); }
    }
  }, [conn?.pairing_phone, local]);

  async function submit(e?: FormEvent) {
    e?.preventDefault();
    const digits = local.replace(/\D/g, '').replace(/^0+/, '');
    if (digits.length < 6 || digits.length > 12) { setError('أدخل رقم هاتف صحيحًا بدون رمز الدولة.'); return; }
    setBusy('request'); setError(''); setCopied(false);
    try { const next = await request({ data: { origin: window.location.origin, phone: `${country}${digits}` } }); setConn(next); setNow(Date.now()); }
    catch (err) { setError((err as Error).message || 'تعذر طلب رمز الربط.'); await sync().catch(() => null); }
    finally { setBusy(''); }
  }
  async function check() {
    setBusy('check'); setError('');
    try { const next = await sync(); if (next?.status !== 'connected') setError('لم يكتمل الربط بعد. أدخل الرمز في واتساب ثم أعد التحقق.'); }
    catch { setError('تعذر التحقق من الحالة.'); } finally { setBusy(''); }
  }
  async function unlink() {
    if (!window.confirm('هل تريد فصل واتساب عن هذا المتجر؟')) return;
    setBusy('disconnect'); setError('');
    try { await disconnect({ data: { platform: 'whatsapp' } }); await sync(); await refreshConnections(); }
    catch (err) { setError((err as Error).message || 'تعذر فصل الحساب.'); } finally { setBusy(''); }
  }
  async function copy() {
    try { await navigator.clipboard.writeText(conn?.pairing_code ?? ''); setCopied(true); } catch { setCopied(false); }
  }

  const status = conn?.status ?? 'disconnected';
  const connected = status === 'connected';

  if (busy === 'load') return <section className="wa-panel" aria-busy="true"><p className="wa-muted"><Loader2 className="animate-spin" /> جارٍ التحقق من حالة الاتصال…</p></section>;

  return (
    <section className="wa-panel" aria-live="polite" dir="rtl">
      {server && !server.ok && <p role="alert" className="wa-alert"><CircleAlert />خادم واتساب غير متاح حاليًا: {server.error}</p>}
      {server?.ok && !server.compatible && <p role="status" className="wa-warn"><CircleAlert />إصدار الخادم {server.version ?? 'غير معروف'} — هذه الميزة مُعدّة لإصدار 2.3.7.</p>}

      {connected ? (
        <div className="wa-connected">
          <CircleCheck />
          <div><strong>متصل بواتساب</strong><span dir="ltr">{conn?.account_name}</span>
            {conn?.verified_at && <small>آخر تحقق: {new Date(conn.verified_at).toLocaleTimeString('ar')}</small>}</div>
        </div>
      ) : pending && !expired ? (
        <div className="wa-code-box">
          <p>أدخل هذا الرمز في واتساب على الهاتف <bdi dir="ltr">+{conn?.pairing_phone}</bdi></p>
          <button type="button" className="wa-code" dir="ltr" onClick={copy} aria-label="نسخ رمز الربط">{formatCode(conn!.pairing_code!)}</button>
          <div className="wa-code-meta"><span>{copied ? 'تم النسخ' : <><Copy /> اضغط للنسخ</>}</span><span>ينتهي خلال {remaining} ث</span></div>
          <ol className="wa-steps">
            <li>افتح واتساب ← الإعدادات ← الأجهزة المرتبطة.</li>
            <li>اضغط «ربط جهاز» ثم «الربط برقم الهاتف بدلاً من ذلك».</li>
            <li>أدخل الرمز أعلاه. سيتم التحديث تلقائيًا.</li>
          </ol>
          <p className="wa-muted"><Loader2 className="animate-spin" /> بانتظار تأكيد واتساب…</p>
        </div>
      ) : (
        <form className="wa-form" onSubmit={submit}>
          {expired && <p role="status" className="wa-warn"><CircleAlert />انتهت صلاحية الرمز. اطلب رمزًا جديدًا.</p>}
          <label className="wa-label" htmlFor="wa-phone">رقم واتساب الخاص بالمتجر</label>
          <div className="wa-phone" dir="ltr">
            <select aria-label="رمز الدولة" value={country} onChange={e => setCountry(e.target.value)}>
              {COUNTRIES.map(c => <option key={c.code} value={c.code}>+{c.code} {c.name}</option>)}
            </select>
            <input id="wa-phone" inputMode="numeric" autoComplete="tel-national" placeholder="7XXXXXXXX" value={local} onChange={e => setLocal(e.target.value.replace(/[^\d\s]/g, ''))} />
          </div>
          <p className="wa-muted"><Smartphone /> اكتب الرقم بدون صفر البداية وبدون رمز الدولة.</p>
        </form>
      )}

      {(error || (conn?.error && !connected)) && <p role="alert" className="wa-alert"><CircleAlert />{error || conn?.error}</p>}

      <div className="wa-actions">
        {!connected && !(pending && !expired) && <Button variant="dashboard" onClick={() => submit()} disabled={busy !== ''}>{busy === 'request' ? <Loader2 className="animate-spin" /> : null}{expired || status === 'error' ? 'إعادة المحاولة' : 'طلب رمز الربط'}</Button>}
        {pending && !expired && <Button variant="outline" onClick={check} disabled={busy !== ''}>{busy === 'check' ? <Loader2 className="animate-spin" /> : <RefreshCw />}تحقق الآن</Button>}
        {pending && !expired && <Button variant="ghost" onClick={() => submit()} disabled={busy !== ''}>طلب رمز جديد</Button>}
        {connected && <Button variant="outline" onClick={check} disabled={busy !== ''}>{busy === 'check' ? <Loader2 className="animate-spin" /> : <RefreshCw />}تحديث الحالة</Button>}
        {conn && status !== 'disconnected' && <Button variant="outline" onClick={unlink} disabled={busy !== ''}>{busy === 'disconnect' ? <Loader2 className="animate-spin" /> : <Unplug />}فصل الحساب</Button>}
      </div>
    </section>
  );
}
