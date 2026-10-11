import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  Bell, Check, ChevronDown, ChevronLeft, Clock, FileSearch, Image, Info, Paperclip,
  RefreshCw, Share2, Sparkles, Tag, Timer, User, Users, Zap,
} from "lucide-react";
import { MenaFlowMark } from "@/components/menaflow-brand";
import { SocialIcon, type SocialPlatform } from "@/components/social-icon";
import { PageHeader } from "@/components/page-header";
import { AppNav } from "@/components/app-nav";

export const Route = createFileRoute("/sources")({
  head: () => ({
    meta: [
      { title: "مصادر المحتوى | MenaFlow" },
      { name: "description", content: "اختر المصدر الذي يغذي قاعدة معرفة الذكاء الاصطناعي في MenaFlow." },
      { property: "og:title", content: "مصادر المحتوى | MenaFlow" },
      { property: "og:description", content: "ربط مصادر المحتوى ومزامنتها ونشرها تلقائياً." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Sources,
});

const imports = [
  { icon: Tag, title: "وصف المنتجات", sub: "النصوص والأسعار والتفاصيل" },
  { icon: Image, title: "صور المنتجات", sub: "حفظ الصور وربطها بكل منتج" },
  { icon: Paperclip, title: "المرفقات الجديدة", sub: "متابعة كل محتوى جديد" },
];
const aiSteps = [
  { icon: FileSearch, t: "استخراج المحتوى والصور" },
  { icon: Tag, t: "تصنيف المنتجات وتنظيم البيانات" },
  { icon: Sparkles, t: "إنشاء منشور جاهز للنشر" },
  { icon: Share2, t: "النشر على حساباتك المرتبطة" },
];
const steps = ["المصدر", "المعالجة بالذكاء الاصطناعي", "المراجعة", "النشر"];
const accounts: SocialPlatform[] = ["whatsapp", "facebook", "instagram"];

function Sources() {
  const [checked, setChecked] = useState([true, true, true]);
  const [auto, setAuto] = useState(true);
  const [saved, setSaved] = useState(false);
  return (
    <main className="dashboard-shell" dir="rtl">
      <PageHeader />

      <section className="px-2 pt-5">
        <h1 className="flex items-center gap-2 text-3xl font-bold">مصادر المحتوى <Sparkles className="size-6 text-primary" /></h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">اختر المصدر الذي يغذي قاعدة معارف الذكاء الاصطناعي. يمكنك تعديل البيانات قبل اعتمادها ونشرها على حساباتك المرتبطة.</p>
        <ol className="mt-5 flex items-start justify-between">
          {steps.map((s, i) => (
            <li key={s} className="flex flex-1 flex-col items-center gap-2 text-center text-xs">
              <span className={`flex size-7 items-center justify-center rounded-full text-sm font-bold ${i === 0 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>{i + 1}</span>
              <span className={i === 0 ? "font-bold text-primary" : "text-muted-foreground"}>{s}</span>
            </li>
          ))}
        </ol>
      </section>

      <div className="flex flex-col gap-3 px-2 py-5">
        <section className="rounded-2xl border bg-card p-4 shadow-sm">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
            <h2 className="flex items-center gap-3 text-xl font-bold"><SocialIcon platform="whatsapp" /> مصدر واتساب</h2>
            <span className="flex items-center gap-2 rounded-full bg-[var(--green-light)] px-3 py-1 text-sm text-primary"><span className="size-2 rounded-full bg-primary" />متصل</span>
          </div>
          <Link to="/manage/$platform" params={{ platform: "whatsapp" }} className="mt-4 flex items-center gap-3 rounded-xl border bg-[var(--mint-surface)] p-3">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-card text-primary"><Users /></span>
            <div className="min-w-0 flex-1 text-sm">
              <p className="font-bold">مجموعة عروض المنتجات</p>
              <p className="text-muted-foreground">مصدر المحتوى الأساسي</p>
              <p className="flex items-center gap-1 text-xs text-muted-foreground"><Clock className="size-3.5" />آخر مزامنة: منذ دقيقتين</p>
            </div>
            <span className="hidden items-center gap-1 rounded-lg border border-primary px-3 py-1.5 text-xs font-semibold text-primary sm:flex"><RefreshCw className="size-3.5" />تغيير المجموعة</span>
            <ChevronLeft className="text-muted-foreground" />
          </Link>
          <p className="mt-3 flex items-center gap-1 text-xs text-muted-foreground"><Info className="size-4" />سيتم جلب النصوص والصور المرسلة في المجموعة تلقائياً</p>
        </section>

        <section className="rounded-2xl border bg-card p-4 shadow-sm">
          <h2 className="mb-3 text-lg font-bold">ما الذي تريد استيراده؟</h2>
          {imports.map(({ icon: I, title, sub }, i) => (
            <button key={title} onClick={() => setChecked((c) => c.map((v, j) => (j === i ? !v : v)))} className="flex w-full items-center gap-3 border-b py-3 text-right last:border-0">
              <span className="flex size-11 items-center justify-center rounded-full border"><I className="size-5" /></span>
              <div className="flex-1"><p className="font-semibold">{title}</p><p className="text-xs text-muted-foreground">{sub}</p></div>
              <span className={`flex size-7 items-center justify-center rounded-md ${checked[i] ? "bg-primary text-primary-foreground" : "border"}`}>{checked[i] && <Check className="size-4" />}</span>
            </button>
          ))}
        </section>

        <section className="rounded-2xl border bg-card p-4 shadow-sm">
          <h2 className="mb-3 text-lg font-bold">ماذا سيفعل الذكاء الاصطناعي؟</h2>
          <ol className="space-y-3">
            {aiSteps.map(({ icon: I, t }, i) => (
              <li key={t} className="flex items-center gap-3 text-sm">
                <span className="flex size-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">{i + 1}</span>
                <span className="flex size-10 items-center justify-center rounded-full border"><I className="size-5" /></span>
                {t}
              </li>
            ))}
          </ol>
        </section>

        <section className="flex items-center justify-between gap-3 rounded-2xl border bg-card p-4 shadow-sm">
          <div><h2 className="font-bold">حسابات النشر</h2><p className="text-xs text-muted-foreground">سيتم النشر على المنصات التي ربطتها</p></div>
          <div className="flex gap-2">
            {accounts.map((p) => (
              <Link key={p} to="/manage/$platform" params={{ platform: p }} className="relative rounded-xl border p-2 [&_.social-icon]:!size-9">
                <SocialIcon platform={p} />
                <Check className="absolute -bottom-1 -left-1 size-4 rounded-full bg-primary p-0.5 text-primary-foreground" />
              </Link>
            ))}
          </div>
        </section>

        <section className="flex items-center gap-3 rounded-2xl border-2 border-primary bg-card p-4">
          <span className="flex size-11 items-center justify-center rounded-full bg-[var(--mint-surface)] text-primary"><Timer /></span>
          <div className="flex-1">
            <h2 className="flex items-center gap-2 font-bold">النشر التلقائي {auto && <span className="flex items-center gap-1 rounded-full bg-[var(--green-light)] px-2 text-xs text-primary"><Zap className="size-3" />مفعل</span>}</h2>
            <p className="text-xs text-muted-foreground">سيتم نشر المنشورات تلقائياً بعد مراجعتها واعتمادها من قبلك.</p>
          </div>
          <button role="switch" aria-checked={auto} aria-label="النشر التلقائي" onClick={() => setAuto(!auto)} className={`flex h-8 w-14 items-center rounded-full p-1 transition ${auto ? "bg-primary" : "bg-muted"}`}>
            <span className={`size-6 rounded-full bg-card shadow transition ${auto ? "-translate-x-6" : ""}`} />
          </button>
        </section>

        <div className="flex gap-3">
          <button onClick={() => setSaved(true)} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary py-3.5 font-bold text-primary-foreground">
            <RefreshCw className="size-5" />{saved ? "تم الحفظ وبدأت المزامنة" : "حفظ المصدر وبدء المزامنة"}
          </button>
          <Link to="/" className="rounded-xl border px-6 py-3.5 font-semibold text-primary">إلغاء</Link>
        </div>
      </div>
      <AppNav active="المصادر" />
    </main>
  );
}
