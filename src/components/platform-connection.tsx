import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Check, ChevronLeft, CircleCheck, Copy, Link as LinkIcon, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MenaFlowMark } from "@/components/menaflow-brand";
import { SocialIcon, type SocialPlatform } from "@/components/social-icon";
import { useAccount } from '@/components/account-provider';
import { ConnectionPanel } from '@/components/connection-panel';
import instagramPhoneAsset from "@/assets/instagram-phone.jpg.asset.json";
const instagramPhone = instagramPhoneAsset.url;
import facebookPhoneAsset from "@/assets/facebook-phone.jpg.asset.json";
const facebookPhone = facebookPhoneAsset.url;
import whatsappPhoneAsset from "@/assets/whatsapp-phone.jpg.asset.json";
const whatsappPhone = whatsappPhoneAsset.url;

const platformDetails = {
  instagram: {
    label: "إنستغرام",
    image: instagramPhone,
    benefits: [
      "إدارة منشوراتك وجدولتها",
      "متابعة التفاعلات والإحصائيات",
      "إدارة الرسائل والتعليقات",
    ],
  },
  facebook: {
    label: "فيسبوك",
    image: facebookPhone,
    benefits: [
      "إدارة منشوراتك وجدولتها",
      "متابعة التفاعلات والإحصائيات",
      "إدارة الرسائل والتعليقات",
    ],
  },
  whatsapp: {
    label: "واتساب",
    image: whatsappPhone,
    benefits: ["إدارة الرسائل والردود", "استخدام القوالب الجاهزة", "متابعة الإحصائيات"],
  },
};

export function PlatformConnection({ platform }: { platform: SocialPlatform }) {
  const { user, connectionError } = useAccount();
  const { label, image, benefits } = platformDetails[platform];
  const [copyState, setCopyState] = useState<"idle" | "copied" | "error">("idle");
  const [showConnectionNotice, setShowConnectionNotice] = useState(false);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopyState("copied");
    } catch {
      setCopyState("error");
    }
  }

  return (
    <main className={`platform-connection-shell platform-theme-${platform}`} dir="rtl">
      <header className="platform-connection-header">
        <div className="brand-wordmark" dir="ltr">
          <MenaFlowMark />
          <span>MenaFlow</span>
        </div>
        <Button asChild variant="dashboardIcon" size="icon" className="platform-connection-back">
          <Link to="/connect-accounts" aria-label="العودة إلى ربط الحسابات">
            <ChevronLeft />
          </Link>
        </Button>
      </header>
      <section className="platform-connection-intro" aria-labelledby="platform-connection-title">
        <SocialIcon platform={platform} />
        <h1 id="platform-connection-title">ربط حسابك على {label}</h1>
        <p>
          قم بتوصيل حسابك على {label} مع <bdi>MenaFlow</bdi> لبدء إدارة محتواك، تتبع تفاعلاتك،
          وتحقيق أفضل النتائج.
        </p>
      </section>
      <section className="platform-permissions" aria-labelledby="platform-permissions-title">
        <h2 id="platform-permissions-title">
          <ShieldCheck />
          ماذا ستُحصّل؟
        </h2>
        <ul>
          {benefits.map((benefit) => (
            <li key={benefit}>
              <CircleCheck />
              <span>{benefit}</span>
            </li>
          ))}
        </ul>
      </section>
      {!user ? <Button asChild variant="dashboard" className="platform-continue-button"><Link to="/auth">سجل الدخول لربط حسابك</Link></Button> : <ConnectionPanel platform={platform} label={label} />}
      {connectionError && <p role="alert" className="platform-action-notice">{connectionError}</p>}
      <div className="platform-or">
        <span>أو</span>
      </div>
      <section className="platform-copy-section">
        <div className="platform-copy-copy">
          <LinkIcon />
          <p>
            إذا كنت تريد ربط حساب مختلف
            <br />
            أو لديك مشاكل في الربط، يمكنك نسخ رابط
            <br />
            الربط من هنا.
          </p>
        </div>
        <Button variant="platformCopy" onClick={copyLink}>
          {copyState === "copied" ? <Check /> : <Copy />}
          <span>{copyState === "copied" ? "تم نسخ رابط الربط" : "نسخ رابط الربط"}</span>
        </Button>
        {copyState === "error" && (
          <p role="status" className="platform-copy-error">
            تعذر نسخ الرابط، يرجى المحاولة مرة أخرى.
          </p>
        )}
      </section>
      <img
        className="platform-footer-art"
        src={image}
        alt={`هاتف مع أيقونة ${label}`}
        width={512}
        height={390}
        loading="lazy"
      />
    </main>
  );
}
