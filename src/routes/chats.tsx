import { chats } from "@/lib/mock-data";
import { Link } from "@tanstack/react-router";
import { createFileRoute } from "@tanstack/react-router";
import { MessageSquareMore } from "lucide-react";
import { Card, SectionPage } from "@/components/section-page";
import { SocialIcon, type SocialPlatform } from "@/components/social-icon";

export const Route = createFileRoute("/chats")({
  head: () => ({
    meta: [
      { title: "MenaFlow | المحادثات" },
      { name: "description", content: "تواصل مع عملائك وأجب على استفساراتهم." },
      { property: "og:title", content: "MenaFlow | المحادثات" },
      { property: "og:description", content: "كل محادثات واتساب وفيسبوك وإنستجرام في مكان واحد." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Chats,
});

const map: Record<string, SocialPlatform> = { واتساب: "whatsapp", فيسبوك: "facebook", إنستجرام: "instagram" };

function Chats() {
  return (
    <SectionPage
      icon={MessageSquareMore}
      tone="green"
      title="المحادثات"
      description="تواصل مع عملائك، أجب على استفساراتهم، وبني علاقات أقوى مع جمهورك"
      filters={["الكل", "واتساب", "فيسبوك", "إنستجرام"]}
      active=""
    >
      {(f) =>
        chats
          .filter((c) => f === "الكل" || map[f] === c.p)
          .map((c) => (
            <Link key={c.name} to="/chats/$id" params={{ id: c.id }} className="block"><Card>
              <div className="flex items-center gap-3">
                <SocialIcon platform={c.p} />
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold">{c.name}</h3>
                  <p className="truncate text-sm text-muted-foreground">{c.msg}</p>
                </div>
                <div className="flex flex-col items-center gap-2 text-xs text-muted-foreground">
                  <span>{c.time}</span>
                  <span className="flex size-6 items-center justify-center rounded-full bg-primary font-bold text-primary-foreground">{c.unread}</span>
                </div>
              </div>
            </Card></Link>
          ))
      }
    </SectionPage>
  );
}
