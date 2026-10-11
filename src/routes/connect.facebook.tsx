import { createFileRoute } from "@tanstack/react-router";
import { PlatformConnection } from "@/components/platform-connection";

export const Route = createFileRoute("/connect/facebook")({
  head: () => ({
    meta: [
      { title: "ربط فيسبوك | MenaFlow" },
      {
        name: "description",
        content: "ربط حساب فيسبوك مع MenaFlow لإدارة المنشورات والتفاعلات والرسائل.",
      },
      { property: "og:title", content: "ربط فيسبوك | MenaFlow" },
      { property: "og:description", content: "توصيل حساب فيسبوك وإدارة محتواك مع MenaFlow." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: FacebookConnection,
});

function FacebookConnection() {
  return <PlatformConnection platform="facebook" />;
}
