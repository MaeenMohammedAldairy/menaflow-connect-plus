import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CheckCheck, MoreVertical, Paperclip, Send, Smile } from "lucide-react";
import { DetailPage, NotFoundBox } from "@/components/detail-page";
import { Button } from "@/components/ui/button";
import { chatMessages, chats } from "@/lib/mock-data";

export const Route = createFileRoute("/chats_/$id")({
  head: () => ({
    meta: [
      { title: "MenaFlow | تفاصيل المحادثة" },
      { name: "description", content: "محادثة العميل والرد على رسائله." },
      { property: "og:title", content: "MenaFlow | تفاصيل المحادثة" },
      { property: "og:description", content: "تفاصيل المحادثة في MenaFlow." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ChatDetail,
});

function ChatDetail() {
  const { id } = Route.useParams();
  const c = chats.find((x) => x.id === id);
  const [msgs, setMsgs] = useState(chatMessages);
  const [text, setText] = useState("");
  return (
    <DetailPage title="تفاصيل المحادثة" back="/chats" active="">
      {!c ? <NotFoundBox /> : (
        <div className="rounded-2xl border bg-card">
          <div className="flex items-center gap-3 border-b p-4">
            <span className="flex size-12 items-center justify-center rounded-full bg-muted text-lg font-bold">{c.name[0]}</span>
            <div className="flex-1"><p className="font-bold">{c.name}</p><p className="text-xs text-primary">متصل الآن</p></div>
            <MoreVertical className="text-muted-foreground" />
          </div>
          <div className="space-y-3 p-3">
            {msgs.map((m, i) => (
              <div key={i} className={`flex ${m.me ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-6 ${m.me ? "bg-[var(--green-light)]" : "bg-muted"}`}>
                  <p>{m.text}</p>
                  <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">{m.time}{m.me && <CheckCheck className="size-4 text-primary" />}</p>
                </div>
              </div>
            ))}
          </div>
          <form className="flex items-center gap-2 border-t p-3" onSubmit={(e) => { e.preventDefault(); if (!text.trim()) return; setMsgs([...msgs, { me: true, text, time: "الآن" }]); setText(""); }}>
            <label className="flex flex-1 items-center gap-2 rounded-full border px-4 py-2">
              <Paperclip className="size-5 text-muted-foreground" />
              <input value={text} onChange={(e) => setText(e.target.value)} placeholder="اكتب رسالتك..." className="flex-1 bg-transparent outline-none" />
              <Smile className="size-5 text-muted-foreground" />
            </label>
            <Button size="icon" className="rounded-full" aria-label="إرسال"><Send /></Button>
          </form>
        </div>
      )}
    </DetailPage>
  );
}
