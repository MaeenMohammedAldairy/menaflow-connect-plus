import { createFileRoute, Link } from '@tanstack/react-router';
import { useState, useEffect, type FormEvent } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { pageHead } from '@/lib/page-head';
export const Route = createFileRoute('/reset-password')({ head: () => pageHead('كلمة مرور جديدة', 'استعد الوصول إلى حساب MenaFlow باستخدام رابط الاستعادة.'), component: ResetPassword });
function ResetPassword() {
  const [ready, setReady] = useState(false); const [notice, setNotice] = useState(''); const [busy, setBusy] = useState(false);
  useEffect(() => { supabase.auth.getUser().then(({ data }) => setReady(Boolean(data.user))); }, []);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); const data = new FormData(e.currentTarget);
    if (data.get('password') !== data.get('confirm')) { setNotice('كلمتا المرور غير متطابقتين.'); return; }
    setBusy(true); const { error } = await supabase.auth.updateUser({ password: String(data.get('password')) }); setNotice(error ? 'تعذر تحديث كلمة المرور. اطلب رابط استعادة جديدًا.' : 'تم تحديث كلمة المرور بنجاح.'); setBusy(false);
  }
  return <main className="settings-shell"><h1>كلمة مرور جديدة</h1>{ready ? <form className="form-stack" onSubmit={submit}><label className="field-label">كلمة المرور<input name="password" type="password" className="plain-input" required minLength={8} /></label><label className="field-label">تأكيد كلمة المرور<input name="confirm" type="password" className="plain-input" required minLength={8} /></label><Button disabled={busy}>تحديث كلمة المرور</Button></form> : <p>افتح هذه الصفحة من رابط استعادة كلمة المرور المرسل إلى بريدك.</p>}<p role="status">{notice}</p><Button asChild variant="link"><Link to="/auth">العودة لتسجيل الدخول</Link></Button></main>;
}