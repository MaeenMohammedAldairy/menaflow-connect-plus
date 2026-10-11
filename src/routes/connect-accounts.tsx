import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, CircleCheck, Lightbulb, Link as LinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MenaFlowMark } from "@/components/menaflow-brand";
import { SocialIcon, type SocialPlatform } from "@/components/social-icon";
import connectionImageAsset from "@/assets/connect-accounts.jpg.asset.json";
const connectionImage = connectionImageAsset.url;

export const Route = createFileRoute("/connect-accounts")({
  head: () => ({
    meta: [
      { title: "ربط حساباتك | MenaFlow" },
      {
        name: "description",
        content: "اربط حسابات إنستغرام وفيسبوك وواتساب مع MenaFlow لإدارة منصاتك من مكان واحد.",
      },
      { property: "og:title", content: "ربط حساباتك | MenaFlow" },
      { property: "og:description", content: "منصات التواصل الاجتماعي المتاحة للربط مع MenaFlow." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ConnectAccounts,
});

const connectionPlatforms: {
  platform: SocialPlatform;
  label: string;
  description: string;
  to: "/connect/instagram" | "/connect/facebook" | "/connect/whatsapp";
}[] = [
  {
    platform: "instagram",
    to: "/connect/instagram",
    label: "إنستغرام",
    description: "قم بربط حسابك على إنستغرام لعرض منشوراتك وتفاعل جمهورك من مكان واحد.",
  },
  {
    platform: "facebook",
    to: "/connect/facebook",
    label: "فيسبوك",
    description: "قم بربط حسابك على فيسبوك لإدارة منشوراتك وتفاعل جمهورك من مكان واحد.",
  },
  {
    platform: "whatsapp",
    to: "/connect/whatsapp",
    label: "واتساب",
    description: "قم بربط حسابك على واتساب للتواصل مع جمهورك بشكل مباشر وسريع.",
  },
];
const connectionBenefits = [
  "إدارة جميع منصاتك من مكان واحد",
  "توفير الوقت والجهد",
  "متابعة التفاعل والإحصائيات",
  "تحسين أداء محتواك",
];

function ConnectAccounts() {
  return (
    <main className="connection-shell" dir="rtl">
      <header className="connection-header">
        <div className="brand-wordmark connection-wordmark" dir="ltr">
          <MenaFlowMark />
          <span>MenaFlow</span>
        </div>
        <Button asChild variant="dashboardIcon" size="icon" className="connection-back">
          <Link to="/" aria-label="العودة إلى الرئيسية">
            <ChevronLeft />
          </Link>
        </Button>
      </header>
      <section className="connection-intro" aria-labelledby="connection-title">
        <div className="connection-intro-copy">
          <h1 id="connection-title">اربط حساباتك الآن</h1>
          <p>
            قم بربط حساباتك على منصات التواصل الاجتماعي لإدارة محتواك، ومتابعة تفاعلك، وتحقيق أفضل
            النتائج من مكان واحد.
          </p>
        </div>
        <img
          className="connection-art"
          src={connectionImage}
          alt="هاتف MenaFlow محاط بأيقونات إنستغرام وفيسبوك وواتساب"
          width={1024}
          height={768}
        />
      </section>
      <section className="connection-platforms" aria-labelledby="available-platforms-title">
        <h2 id="available-platforms-title">المنصات المتاحة للربط</h2>
        <div className="connection-platform-list">
          {connectionPlatforms.map(({ platform, label, description, to }) => (
            <article className="connection-platform-row" key={platform}>
              <ChevronRight className="connection-row-chevron" />
              <SocialIcon platform={platform} />
              <div className="connection-platform-copy">
                <h3>{label}</h3>
                <p>{description}</p>
              </div>
              <Button asChild variant="dashboard" className="connection-account-button">
                <Link to={to} aria-label={`ربط حساب ${label}`}>
                  <LinkIcon />
                  <span>ربط الحساب</span>
                </Link>
              </Button>
            </article>
          ))}
        </div>
      </section>
      <section className="connection-benefits" aria-labelledby="connection-benefits-title">
        <h2 id="connection-benefits-title">
          <Lightbulb />
          لماذا تربط حساباتك؟
        </h2>
        <div className="connection-benefit-grid">
          {connectionBenefits.map((benefit) => (
            <div className="connection-benefit" key={benefit}>
              <CircleCheck />
              <p>{benefit}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
