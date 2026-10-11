import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { ArrowLeft, Eye, EyeOff, LockKeyhole, Mail, UserRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MenaFlowMark } from '@/components/menaflow-brand';
import { supabase } from '@/integrations/supabase/client';
import { lovable } from '@/integrations/lovable';
import robot from '@/assets/menaflow-robot.jpg.asset.json';

export function AuthScreen({ signup = false }: { signup?: boolean }) {
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [reset, setReset] = useState(false);
  const navigate = useNavigate();
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); setBusy(true); setError(''); setNotice('');
    const form = new FormData(e.currentTarget);
    const email = String(form.get('email') ?? '').trim().toLowerCase();
    const password = String(form.get('password') ?? '');
    try {
      if (reset) {
        const result = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-password` });
        if (result.error) throw result.error;
        setNotice('إذا كان البريد مسجلاً، ستصلك رسالة لإعادة تعيين كلمة المرور.');
      } else if (signup) {
        if (password !== form.get('confirm')) { setError('كلمتا المرور غير متطابقتين.'); return; }
        const result = await supabase.auth.signUp({ email, password, options: { data: { display_name: String(form.get('name') ?? '') }, emailRedirectTo: `${window.location.origin}/auth` } });
        if (result.error) throw result.error;
        if (result.data.session) await navigate({ to: '/' });
        else setNotice('تم إنشاء الحساب. تحقق من بريدك لتأكيد الحساب ثم سجل الدخول.');
      } else {
        const result = await supabase.auth.signInWithPassword({ email, password });
        if (result.error) throw result.error;
        await navigate({ to: '/' });
      }
    } catch (err) {
      const m = String((err as { message?: string })?.message ?? '').toLowerCase();
      const known = m.includes('invalid login credentials') ? 'البريد الإلكتروني أو كلمة المرور غير صحيحة.'
        : m.includes('email not confirmed') ? 'لم يتم تأكيد بريدك بعد. افتح رسالة التأكيد في بريدك ثم سجّل الدخول.'
        : m.includes('already registered') || m.includes('already been registered') ? 'هذا البريد مسجل مسبقًا. سجّل الدخول أو استعد كلمة المرور.'
        : m.includes('password') && (m.includes('weak') || m.includes('pwned') || m.includes('at least')) ? 'كلمة المرور ضعيفة. استخدم 8 أحرف على الأقل مع أرقام ورموز.'
        : m.includes('rate limit') || m.includes('too many') ? 'محاولات كثيرة. انتظر قليلًا ثم حاول مجددًا.'
        : (m.includes('invalid') || m.includes('not allowed')) && m.includes('email') ? 'صيغة البريد الإلكتروني غير صحيحة.'
        : '';
      if (known) { setError(known); return; }
      setError(reset ? 'تعذر إرسال الرسالة الآن. حاول مجددًا.' : signup ? 'تعذر إنشاء الحساب. تحقق من البريد وكلمة المرور أو حاول لاحقًا.' : 'تعذر تسجيل الدخول. تحقق من بياناتك وتأكيد بريدك الإلكتروني.');
    }
    finally { setBusy(false); }
  }
  async function google() {
    setBusy(true); setError('');
    try {
      const result = await lovable.auth.signInWithOAuth('google', { redirect_uri: `${window.location.origin}/auth` });
      if (result.error) { setError('تعذر تسجيل الدخول عبر Google. حاول مجددًا.'); return; }
      if (result.redirected) return;
      await navigate({ to: '/' });
    } finally { setBusy(false); }
  }
  return <main className="auth-shell" dir="rtl">
    <header className="auth-header"><Link to="/" className="brand-wordmark" dir="ltr"><MenaFlowMark /><span>MenaFlow</span></Link><Button asChild variant="ghost"><Link to="/">الرئيسية <ArrowLeft /></Link></Button></header>
    <div className="auth-layout">
      <section className="auth-intro"><img src={robot.url} alt="مساعد MenaFlow الذكي" /><h1>{signup ? 'إنشاء حساب جديد' : reset ? 'استعادة حسابك' : 'مرحباً بعودتك'}</h1><p>{signup ? 'ابدأ رحلتك نحو إدارة وسائل التواصل الاجتماعي بذكاء واحترافية.' : 'حساباتك، محتواك وجمهورك. كل شيء في مكان واحد.'}</p></section>
      <section className="auth-form-section"><h2>{signup ? 'انضم إلى MenaFlow' : reset ? 'نسيت كلمة المرور؟' : 'تسجيل الدخول'}</h2><form onSubmit={submit} className="form-stack">
        {signup && <label className="field-label">اسم المستخدم<span className="field-input"><UserRound /><input name="name" autoComplete="name" required placeholder="أدخل اسم المستخدم" /></span></label>}
        <label className="field-label">البريد الإلكتروني<span className="field-input"><Mail /><input name="email" type="email" autoComplete="email" required placeholder="example@domain.com" dir="ltr" /></span></label>
        {!reset && <label className="field-label">كلمة المرور<span className="field-input"><LockKeyhole /><input name="password" type={show ? 'text' : 'password'} autoComplete={signup ? 'new-password' : 'current-password'} required minLength={signup ? 8 : undefined} placeholder="أدخل كلمة المرور" /><Button type="button" variant="ghost" size="icon" aria-label={show ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'} onClick={() => setShow(!show)}>{show ? <EyeOff /> : <Eye />}</Button></span></label>}
        {signup && <label className="field-label">إعادة إدخال كلمة المرور<span className="field-input"><LockKeyhole /><input name="confirm" type={show ? 'text' : 'password'} autoComplete="new-password" required minLength={8} placeholder="أعد إدخال كلمة المرور" /></span></label>}
        {!signup && <Button type="button" variant="link" className="self-start" onClick={() => { setReset(!reset); setError(''); setNotice(''); }}>{reset ? 'العودة لتسجيل الدخول' : 'نسيت كلمة المرور؟'}</Button>}
        {error && <p role="alert" className="text-destructive text-sm">{error}</p>}{notice && <p role="status" className="notice">{notice}</p>}
        <Button variant="dashboard" className="primary-action" disabled={busy}>{busy ? 'جارٍ المتابعة…' : reset ? 'إرسال رابط الاستعادة' : signup ? 'إنشاء حساب' : 'تسجيل الدخول'}<ArrowLeft /></Button>
      </form>
      {!reset && <><div className="form-divider">أو المتابعة عبر</div><Button variant="outline" className="social-signin" disabled={busy} onClick={google}><span className="google-letter">G</span> Google</Button></>}
      <p className="auth-footer">{signup ? 'لديك حساب بالفعل؟' : 'ليس لديك حساب؟'} <Link to={signup ? '/auth' : '/signup'}>{signup ? 'تسجيل الدخول' : 'إنشاء حساب جديد'}</Link></p>
      </section>
    </div>
  </main>;
}