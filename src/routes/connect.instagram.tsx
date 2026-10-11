import { createFileRoute } from "@tanstack/react-router";
import { PlatformConnection } from "@/components/platform-connection";

export const Route = createFileRoute("/connect/instagram")({
  head: () => ({
    meta: [
      { title: "ربط إنستغرام | MenaFlow" },
      {
        name: "description",
        content: "ربط حساب إنستغرام مع MenaFlow لإدارة المنشورات والتفاعلات والرسائل.",
      },
      { property: "og:title", content: "ربط إنستغرام | MenaFlow" },
      { property: "og:description", content: "توصيل حساب إنستغرام وإدارة محتواك مع MenaFlow." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: InstagramConnection,
});

function InstagramConnection() {
  return <PlatformConnection platform="instagram" />;
}
