import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowUp,
  Bell,
  Box,
  CalendarDays,
  CalendarRange,
  ChartNoAxesColumnIncreasing,
  ChevronDown,
  ChevronLeft,
  FileText,
  House,
  Link as LinkIcon,
  MessageSquareMore,
  Plus,
  Settings,
  Share2,
} from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { useAccount } from "@/components/account-provider";
import { canManagePlatform, connectionPaths } from "@/lib/platform-access";
import { Button } from "@/components/ui/button";
import { AppNav } from "@/components/app-nav";
import { MenaFlowMark } from "@/components/menaflow-brand";
import { SocialIcon, type SocialPlatform } from "@/components/social-icon";
import robotImageAsset from "@/assets/menaflow-robot.jpg.asset.json";
const robotImage = robotImageAsset.url;

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MenaFlow | الرئيسية" },
      {
        name: "description",
        content: "منصتك الذكية لإدارة حساباتك الاجتماعية، المحتوى والمحادثات في مكان واحد.",
      },
      { property: "og:title", content: "MenaFlow | الرئيسية" },
      { property: "og:description", content: "حساباتك الاجتماعية وأحدث الأنشطة مع MenaFlow." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const stats = [
  { label: "المنتجات", value: "24", growth: "12%", icon: Box, tone: "amber", to: "/products" as const },
  { label: "المنشورات", value: "18", growth: "38%", icon: CalendarRange, tone: "violet", to: "/posts" as const },
  { label: "المحادثات", value: "34", growth: "19%", icon: MessageSquareMore, tone: "blue", to: "/chats" as const },
  { label: "الطلبات", value: "12", growth: "20%", icon: CalendarDays, tone: "green", to: "/orders" as const },
];
const platforms: { platform: SocialPlatform; label: string }[] = [
  { platform: "whatsapp", label: "واتساب" },
  { platform: "facebook", label: "فيسبوك" },
  { platform: "instagram", label: "إنستغرام" },
];
const navigation = [
  { label: "الرئيسية", icon: House },
  { label: "المحتوى", icon: FileText },
  { label: "المنصات", icon: Share2 },
  { label: "التقارير", icon: ChartNoAxesColumnIncreasing },
  { label: "الإعدادات", icon: Settings },
];

function Index() {
  const { user, connections } = useAccount();
  return (
    <main className="dashboard-shell" dir="rtl">
      <PageHeader />
      <section className="welcome-section" aria-labelledby="welcome-title">
        <div className="welcome-copy">
          <span className="eyebrow">مساحة عملك الاجتماعية</span>
          <h1 id="welcome-title">مرحباً بك في <bdi>MenaFlow</bdi></h1>
          <p>حساباتك الاجتماعية، محتواك ومحادثاتك.
            <br />كل ما تحتاجه في مكان واحد.</p>
          <Button asChild variant="dashboard" className="connect-button">
            <Link to="/connect-accounts">
              <LinkIcon />
              <span>اربط حساباتك الآن</span>
              <ChevronLeft />
            </Link>
          </Button>
        </div>
        <img
          className="welcome-art"
          src={robotImage}
          alt="روبوت MenaFlow مع أيقونات التواصل الاجتماعي"
          width={1024}
          height={768}
        />
        <div className="carousel-dots" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
      </section>

      <section className="quick-links" aria-label="أقسام مساحة العمل">
        {stats.map(({ label, icon: Icon, tone, to }) => <Link to={to} className="quick-link" key={label}><span className={`stat-icon stat-${tone}`}><Icon /></span><h2>{label}</h2><ChevronLeft /></Link>)}
      </section>
      <section className="platforms-section" aria-labelledby="platforms-title">
        <h2 id="platforms-title" className="section-title">
          حسابات التواصل
        </h2>
        <div className="platform-grid">
          {platforms.map(({ platform, label }) => canManagePlatform(platform, connections) ? (
            <Link to="/manage/$platform" params={{ platform }} className="platform-item platform-tile-link" key={platform} aria-label={`إدارة ${label}`}><SocialIcon platform={platform} /><h3>{label}</h3><span className="connection-status">متصل</span><span>إدارة الحساب</span></Link>
          ) : (
            <Link to={connectionPaths[platform]} className="platform-item platform-tile-link" key={platform} aria-label={`ربط ${label}`}><SocialIcon platform={platform} /><h3>{label}</h3><span className="connection-status disconnected">غير مرتبط</span><span>ربط الحساب <Plus className="inline size-3" /></span></Link>
          ))}
        </div>
      </section>

      <section className="home-workflow"><div><span className="eyebrow">من المصدر إلى المنشور</span><h2>محتواك جاهز للمراجعة</h2><p>راجع التفاصيل والصور قبل اعتماد أي منشور.</p><Button asChild variant="outline"><Link to="/review"><FileText />مراجعة المحتوى <ChevronLeft /></Link></Button></div><div className="home-workflow-links"><Link to="/sources"><Share2 />مصادر المحتوى <ChevronLeft /></Link><Link to="/onboarding"><House />اكتشف MenaFlow <ChevronLeft /></Link><Link to={user ? '/settings' : '/signup'}><Settings />{user ? 'إعدادات الحساب' : 'إنشاء حساب جديد'}<ChevronLeft /></Link></div></section>
      <AppNav active="الرئيسية" />
    </main>
  );
}
