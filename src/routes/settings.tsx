import { createFileRoute, Link } from '@tanstack/react-router';
import { useEffect, useState, type FormEvent } from 'react';
import { Bell, Check, LogOut, Save, ShieldCheck, UserRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { PageHeader } from '@/components/page-header';
import { AppNav } from '@/components/app-nav';
import { useAccount } from '@/components/account-provider';
import { supabase } from '@/integrations/supabase/client';
import { pageHead } from '@/lib/page-head';
import { platformLabels, canManagePlatform, connectionPaths, type PlatformName } from '@/lib/platform-access';
import { SocialIcon } from '@/components/social-icon';
export const Route = createFileRoute('/settings')({ head: () => pageHead('الإعدادات', 'إعدادات حساب MenaFlow والإشعارات وحسابات التواصل المرتبطة.'), component: Settings });
function Settings() {
  const { user, loading, connections } = useAccount();
  const [name, setName] = useState(''); const [notifications, setNotifications] = useState(true); const [auto, setAuto] = useState(false);
  const [busy, setBusy] = useState(false); const [notice, setNotice] = useState('');
  useEffect(() => {
    if (!user) return;
    setName(user.user_metadata?.['display_name'] ?? '');
    supabase.from('user_settings').select('*').eq('user_id', user.id).maybeSingle().then(({ data, error }) => {
      if (error) { setNotice('تعذر تحميل الإعدادات. حاول مجددًا.'); return; }
      if (data) { setName(data.display_name); setNotifications(data.notifications); setAuto(data.auto_publish); }
    });
  }, [user]);
  async function save(e: FormEvent) {
    e.preventDefault(); if (!user) return; setBusy(true); setNotice('');
    const { error } = await supabase.from('user_settings').upsert({ user_id: user.id, display_name: name, notifications, auto_publish: auto, updated_at: new Date().toISOString() });
    setNotice(error ? 'تعذر حفظ الإعدادات. حاول مجددًا.' : 'تم حفظ إعداداتك بنجاح.'); setBusy(false);
  }
  return <main className="dashboard-shell"><PageHeader /><div className="page-title"><span className="eyebrow">حسابك</span><h1>الإعدادات</h1></div>
    {loading ? <p role="status">جارٍ تحميل الحساب…</p> : !user ? <section className="empty-state"><UserRound /><h2>إعدادات حسابك في مكان واحد</h2><Button variant="dashboard" asChild><Link to="/auth">تسجيل الدخول</Link></Button></section> : <form onSubmit={save} className="settings-layout">
      <section className="settings-section"><h2><UserRound />الملف الشخصي</h2><label className="field-label">اسم المستخدم<input className="plain-input" value={name} onChange={e => setName(e.target.value)} required /></label><label className="field-label">البريد الإلكتروني<input className="plain-input" value={user.email ?? ''} readOnly dir="ltr" /></label><Button variant="link" asChild><Link to="/auth">إعادة تعيين كلمة المرور</Link></Button><div className="setting-row"><div><h3><Bell />الإشعارات</h3><p>تفضيل إشعارات النشاط داخل الحساب</p></div><Switch checked={notifications} onCheckedChange={setNotifications} aria-label="الإشعارات" /></div><div className="setting-row"><div><h3>النشر بعد الاعتماد</h3><p>تفضيل النشر التلقائي بعد ربط خدمات النشر</p></div><Switch checked={auto} onCheckedChange={setAuto} aria-label="النشر بعد الاعتماد" /></div><p className="notice"><ShieldCheck />لا يتم النشر إلا على حسابات مرتبطة فعليًا.</p><Button variant="dashboard" className="primary-action" disabled={busy}><Save />{busy ? 'جارٍ الحفظ…' : 'حفظ الإعدادات'}</Button>{notice && <p role="status" className="notice">{notice}</p>}</section>
      <section className="settings-section"><h2>الحسابات المرتبطة</h2>{(Object.keys(platformLabels) as PlatformName[]).map(platform => <div className="setting-row" key={platform}><div className="flex items-center gap-3"><SocialIcon platform={platform} /><div><h3>{platformLabels[platform]}</h3><p>{canManagePlatform(platform, connections) ? 'متصل' : 'غير مرتبط'}</p></div></div>{canManagePlatform(platform, connections) ? <Button asChild variant="outline"><Link to="/manage/$platform" params={{ platform }}><Check />إدارة</Link></Button> : <Button asChild variant="outline"><Link to={connectionPaths[platform]}>ربط الحساب</Link></Button>}</div>)}<Button type="button" variant="outline" className="mt-8" onClick={async () => { const { error } = await supabase.auth.signOut(); if (error) setNotice('تعذر تسجيل الخروج.'); }}><LogOut />تسجيل الخروج</Button></section>
    </form>}<AppNav active="الإعدادات" /></main>;
}