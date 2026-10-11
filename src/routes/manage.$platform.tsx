import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import {
  ArrowUpRight, Bell, Check, ChevronDown, ChevronLeft, ChevronRight, Eye, FileText, Heart,
  MessageCircle, MessageSquare, Send, Server, ShieldCheck, ThumbsUp, UserPlus, Users,
} from "lucide-react";
import { SocialIcon, type SocialPlatform } from "@/components/social-icon";
import { AppNav } from "@/components/app-nav";
import { chats, posts } from "@/lib/mock-data";
import { useAccount } from '@/components/account-provider';
import { canManagePlatform } from '@/lib/platform-access';
import { PlatformConnection } from '@/components/platform-connection';

const data = {
  facebook: {
    title: "إدارة فيسبوك", sub: "Meta Business / Facebook Pages", account: "صفحة معين للبرمجيات", accountSub: "Facebook Page",
    stats: [{ l: "المتابعون", v: "12,458", g: "+12%", i: ThumbsUp }, { l: "الوصول", v: "48,230", g: "+18%", i: Eye }, { l: "المنشورات", v: "24", g: "+33%", i: FileText }],
    listTitle: "الصفحات المتصلة", itemSub: "ID: 1234567890",
    perms: ["pages_show_list", "pages_read_engagement", "pages_manage_posts", "instagram_basic"],
  },
  instagram: {
    title: "إدارة إنستجرام", sub: "Instagram Business", account: "@maeen.software", accountSub: "Instagram Business",
    stats: [{ l: "المتابعون", v: "8,932", g: "+15%", i: UserPlus }, { l: "الوصول", v: "28,450", g: "+22%", i: Eye }, { l: "المنشورات", v: "18", g: "+40%", i: FileText }],
    listTitle: "الحسابات المتصلة", itemSub: "Business Account • ID: 1789456123",
    perms: ["instagram_basic", "instagram_content_publish", "pages_show_list", "pages_read_engagement"],
  },
  whatsapp: {
    title: "إدارة واتساب", sub: "Evolution API / WhatsApp Business", account: "+967 77 000 0000", accountSub: "رقم واتساب المتصل",
    stats: [{ l: "العملاء الجدد", v: "1,142", g: "+28%", i: UserPlus }, { l: "الرسائل المرسلة", v: "3,620", g: "+35%", i: Send }, { l: "المحادثات", v: "1,248", g: "+28%", i: MessageCircle }],
    listTitle: "", itemSub: "", perms: [],
  },
} as const;

const groups = [
  { name: "مجموعة المتجر الرئيسي", count: 324 },
  { name: "مجموعة العملاء", count: 186 },
  { name: "مجموعة العروض", count: 102 },
];

export const Route = createFileRoute("/manage/$platform")({
  loader: ({ params }) => {
    if (!(params.platform in data)) throw notFound();
    return { platform: params.platform as SocialPlatform };
  },
  head: ({ loaderData }) => {
    const t = loaderData ? data[loaderData.platform].title : "غير موجود";
    return {
      meta: [
        { title: `${t} | MenaFlow` },
        { name: "description", content: `${t}: الإحصائيات والحسابات المتصلة وآخر النشاطات في MenaFlow.` },
        { property: "og:title", content: `${t} | MenaFlow` },
        { property: "og:description", content: `${t} من لوحة MenaFlow.` },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary" },
      ],
    };
  },
  component: Manage,
  notFoundComponent: () => <p className="p-10 text-center">المنصة غير موجودة</p>,
  errorComponent: () => <p className="p-10 text-center">حدث خطأ</p>,
});

const card = "rounded-2xl border bg-card p-4 shadow-sm";

function Manage() {
  const { platform } = Route.useLoaderData();
  const { connections, loading } = useAccount();
  if (loading) return <main className="settings-shell" role="status">جارٍ التحقق من اتصال الحساب…</main>;
  if (!canManagePlatform(platform, connections)) return <PlatformConnection platform={platform} />;
  const d = data[platform];
  const tint = `platform-tint-${platform}`;
  return (
    <main className="dashboard-shell" dir="rtl">
      <header className="flex items-center gap-3 px-1">
        <Link to="/connect-accounts" aria-label="رجوع"><ChevronRight className="size-7" /></Link>
        <span className="[&_.social-icon]:!size-14"><SocialIcon platform={platform} /></span>
        <div className="min-w-0 flex-1">
          <h1 className="text-xl font-bold">{d.title}</h1>
          <p className="truncate text-xs text-muted-foreground" dir="ltr">{d.sub}</p>
        </div>
        <span className="relative"><Bell className="size-6" /><span className="notification-count">3</span></span>
      </header>

      <div className="flex flex-col gap-3 px-1 py-5">
        <section className={`${card} ${tint} flex items-center gap-3`}>
          <span className="[&_.social-icon]:!size-11"><SocialIcon platform={platform} /></span>
          <div className="flex-1">
            <p className="font-bold" dir={platform === "facebook" ? "rtl" : "ltr"}>{d.account}</p>
            <p className="text-xs text-muted-foreground">{d.accountSub}</p>
          </div>
          <div className="text-left">
            <p className="flex items-center justify-end gap-1 font-semibold text-primary"><span className="size-2 rounded-full bg-primary" />متصل</p>
            <p className="text-xs text-muted-foreground">{platform === "whatsapp" ? "جاهز للاستقبال · Evolution API" : "تم منح جميع الصلاحيات بنجاح"}</p>
          </div>
        </section>

        <section className="grid grid-cols-3 gap-2">
          {d.stats.map(({ l, v, g, i: I }) => (
            <div key={l} className={`${card} ${tint} !p-3`}>
              <I className="size-6 text-primary" />
              <p className="mt-2 text-xs text-muted-foreground">{l}</p>
              <p className="text-xl font-bold" dir="ltr">{v}</p>
              <p className="flex items-center gap-1 text-xs text-primary" dir="ltr"><ArrowUpRight className="size-3" />{g}</p>
            </div>
          ))}
        </section>

        {platform === "whatsapp" ? (
          <>
            <section className={card}>
              <div className="flex items-center justify-between">
                <h2 className="flex items-center gap-2 font-bold"><span className="size-2.5 rounded-full bg-primary" />الاتصال بـ Evolution API</h2>
                <span className="rounded-lg border px-3 py-1 text-sm text-primary">إدارة</span>
              </div>
              <div className="mt-3 flex items-center gap-3 rounded-xl bg-[var(--mint-surface)] p-3 text-sm">
                <Server className="size-8 text-primary" />
                <dl className="grid flex-1 grid-cols-2 gap-y-1">
                  <dt className="text-muted-foreground">رقم القناة (Instance)</dt><dd className="text-left">123456</dd>
                  <dt className="text-muted-foreground">آخر مزامنة</dt><dd className="text-left">2025/05/12 10:24</dd>
                  <dt className="text-muted-foreground">حالة الجلسة</dt><dd className="text-left font-bold text-primary">نشطة</dd>
                </dl>
              </div>
            </section>
            <section className={card}>
              <div className="mb-2 flex justify-between"><h2 className="font-bold">قوائم المجموعات</h2><Link to="/sources" className="text-sm text-primary">عرض الكل</Link></div>
              {groups.map((g) => (
                <Link key={g.name} to="/sources" className="flex items-center gap-3 border-b py-3 last:border-0">
                  <span className="flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground"><Users /></span>
                  <div className="flex-1 text-sm">
                    <p className="font-bold">{g.name}</p>
                    <p className="text-xs text-muted-foreground">استقبال الرسائل <span className="mr-2 rounded bg-[var(--green-light)] px-2 text-primary">تفعيل</span></p>
                  </div>
                  <div className="text-xs text-muted-foreground">رسائل اليوم<p className="font-bold text-foreground">{g.count}</p></div>
                  <ChevronLeft className="text-muted-foreground" />
                </Link>
              ))}
            </section>
            <section className={card}>
              <div className="mb-2 flex justify-between"><h2 className="font-bold">آخر الرسائل</h2><Link to="/chats" className="text-sm text-primary">عرض الكل</Link></div>
              {chats.filter((c) => c.p === "whatsapp").map((c) => (
                <Link key={c.id} to="/chats/$id" params={{ id: c.id }} className="flex items-center gap-3 border-b py-3 last:border-0">
                  <span className="flex size-11 items-center justify-center rounded-full bg-muted"><Users className="size-5" /></span>
                  <div className="min-w-0 flex-1"><p className="font-bold">{c.name}</p><p className="truncate text-xs text-muted-foreground">{c.msg}</p></div>
                  <div className="text-center text-xs text-muted-foreground">{c.time}<p className="mx-auto mt-1 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground">{c.unread}</p></div>
                </Link>
              ))}
            </section>
          </>
        ) : (
          <>
            <section className={card}>
              <div className="flex items-center justify-between">
                <h2 className="flex items-center gap-2 font-bold"><span className="size-2.5 rounded-full bg-primary" />{d.listTitle}</h2>
                <span className="text-sm">1 / 1 <span className="mr-2 rounded-lg border px-3 py-1 text-primary">إدارة</span></span>
              </div>
              <div className="mt-3 flex items-center gap-3 rounded-xl border p-3">
                <span className="[&_.social-icon]:!size-11"><SocialIcon platform={platform} /></span>
                <div className="flex-1 text-sm"><p className="font-bold">{d.account}</p><p className="text-xs text-muted-foreground" dir="ltr">{d.itemSub}</p></div>
                <span className="flex items-center gap-1 rounded-full bg-[var(--green-light)] px-2 py-0.5 text-xs text-primary"><Check className="size-3" />متصل</span>
                <ChevronDown className="size-4" />
              </div>
            </section>
            <section className={card}>
              <h2 className="mb-3 flex items-center gap-2 font-bold"><ShieldCheck className="size-5 text-primary" />الأذونات الممنوحة</h2>
              <div className="grid grid-cols-2 gap-2">
                {d.perms.map((p) => (
                  <span key={p} className={`${tint} flex items-center justify-between gap-1 rounded-lg border px-2 py-1.5 text-[11px]`} dir="ltr">{p}<Check className="size-3.5 text-primary" /></span>
                ))}
              </div>
            </section>
            <section className={card}>
              <div className="mb-2 flex justify-between"><h2 className="font-bold">آخر المنشورات</h2><Link to="/posts" className="text-sm text-primary">عرض الكل</Link></div>
              {posts.filter((x) => x.p === platform).map((x) => (
                <Link key={x.id} to="/posts/$id" params={{ id: x.id }} className="flex items-center gap-3 border-b py-3 last:border-0">
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-2 font-semibold [&_.social-icon]:!size-6"><SocialIcon platform={platform} />{x.text}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{x.date}</p>
                    <div className="mt-1 flex gap-3 text-xs text-muted-foreground" dir="ltr">
                      <span className="flex items-center gap-1"><Heart className="size-3" />{x.likes}</span>
                      <span className="flex items-center gap-1"><MessageSquare className="size-3" />{x.comments}</span>
                    </div>
                  </div>
                  <ChevronLeft className="text-muted-foreground" />
                </Link>
              ))}
            </section>
          </>
        )}
      </div>
      <AppNav active="المنصات" />
    </main>
  );
}
