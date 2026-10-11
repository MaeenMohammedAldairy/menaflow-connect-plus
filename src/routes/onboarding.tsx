import { createFileRoute, Link } from '@tanstack/react-router';
import { useState } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MenaFlowMark } from '@/components/menaflow-brand';
import { pageHead } from '@/lib/page-head';
import robot from '@/assets/menaflow-robot.jpg.asset.json';
import platforms from '@/assets/platform-phones.jpg.asset.json';
import accounts from '@/assets/connect-accounts.jpg.asset.json';
export const Route = createFileRoute('/onboarding')({ head: () => pageHead('مرحباً بك', 'اكتشف MenaFlow لإدارة التواصل الاجتماعي والمحتوى وخدمة العملاء.'), component: Onboarding });
const slides = [
  { title: 'منصتك الذكية لإدارة حساباتك الاجتماعية', text: 'كل أدواتك في مكان واحد. لتوفر وقتك وجهدك وتزيد من تأثيرك.', image: robot.url },
  { title: 'موظف خدمة العملاء يعمل 24 ساعة', text: 'تواصل مع جمهورك عبر جميع قنوات التواصل.', image: robot.url },
  { title: 'حساباتك في مكان واحد', text: 'اربط منصاتك الاجتماعية وأدر محتواك بسهولة.', image: accounts.url },
  { title: 'نشر تلقائي للمنشورات على جميع المنصات', text: 'راجع محتواك واعتمده لحساباتك المرتبطة.', image: platforms.url },
];
function Onboarding() {
  const [step, setStep] = useState(0); const slide = slides[step];
  if (!slide) return null;
  return <main className="onboarding-shell"><header className="auth-header"><Link to="/" className="brand-wordmark" dir="ltr"><MenaFlowMark /><span>MenaFlow</span></Link><Button asChild variant="ghost"><Link to="/auth">تخطي</Link></Button></header><section className="onboarding-content"><img key={step} src={slide.image} alt="مساعد MenaFlow ومنصات التواصل" /><h1>{slide.title}</h1><p>{slide.text}</p><div className="onboarding-dots">{slides.map((s, i) => <Button key={s.title} variant="ghost" size="icon" className={i === step ? 'dot selected' : 'dot'} aria-label={`الشريحة ${i + 1}`} aria-current={i === step ? 'step' : undefined} onClick={() => setStep(i)} />)}</div><div className="onboarding-actions">{step > 0 && <Button variant="outline" size="icon" aria-label="السابق" onClick={() => setStep(step - 1)}><ArrowRight /></Button>}{step === slides.length - 1 ? <Button asChild variant="dashboard" className="primary-action"><Link to="/signup">ابدأ الآن <ArrowLeft /></Link></Button> : <Button variant="dashboard" className="primary-action" onClick={() => setStep(step + 1)}>التالي <ArrowLeft /></Button>}</div></section></main>;
}