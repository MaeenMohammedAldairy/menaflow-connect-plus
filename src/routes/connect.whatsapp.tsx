import { createFileRoute } from "@tanstack/react-router";
import { PlatformConnection } from "@/components/platform-connection";

export const Route = createFileRoute("/connect/whatsapp")({
  head: () => ({
    meta: [
      { title: "ربط واتساب | MenaFlow" },
      {
        name: "description",
        content: "ربط حساب واتساب مع MenaFlow لإدارة الرسائل والردود والقوالب الجاهزة.",
      },
      { property: "og:title", content: "ربط واتساب | MenaFlow" },
      { property: "og:description", content: "توصيل حساب واتساب ومتابعة رسائلك مع MenaFlow." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: WhatsappConnection,
});

function WhatsappConnection() {
  return <PlatformConnection platform="whatsapp" />;
}
