import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Eye, Heart, Image, MessageSquare, MoreVertical, Send, Share2 } from "lucide-react";
import { DetailPage, NotFoundBox } from "@/components/detail-page";
import { Card } from "@/components/section-page";
import { MenaFlowMark } from "@/components/menaflow-brand";
import { SocialIcon } from "@/components/social-icon";
import { Button } from "@/components/ui/button";
import { postComments, posts } from "@/lib/mock-data";

export const Route = createFileRoute("/posts_/$id")({
  head: () => ({
    meta: [
      { title: "MenaFlow | تفاصيل المنشور" },
      { name: "description", content: "عرض المنشور وتفاعلاته وتعليقاته." },
      { property: "og:title", content: "MenaFlow | تفاصيل المنشور" },
      { property: "og:description", content: "تفاصيل المنشور والتعليقات في MenaFlow." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PostDetail,
});

function PostDetail() {
  const { id } = Route.useParams();
  const p = posts.find((x) => x.id === id);
  const [comments, setComments] = useState(postComments);
  const [text, setText] = useState("");
  return (
    <DetailPage title="تفاصيل المنشور" back="/posts" active="المحتوى">
      {!p ? <NotFoundBox /> : (
        <>
          <Card>
            <div className="flex items-center gap-3">
              <span className="profile-mark"><MenaFlowMark /></span>
              <div className="flex-1"><p className="font-bold" dir="ltr">MenaFlow</p><p className="text-xs text-muted-foreground">{p.date}</p></div>
              <SocialIcon platform={p.p} />
            </div>
            <p className="my-3 leading-7">{p.text}</p>
            <div className="flex h-48 items-center justify-center rounded-xl bg-[var(--mint-surface)] text-primary"><Image className="size-16" /></div>
            <div className="mt-3 flex gap-5 text-sm text-muted-foreground">
              <span className="flex items-center gap-1"><Heart className="size-5 fill-destructive text-destructive" />{p.likes}</span>
              <span className="flex items-center gap-1"><MessageSquare className="size-5" />{p.comments}</span>
              <span className="flex items-center gap-1"><Share2 className="size-5" />{p.shares}</span>
            </div>
          </Card>
          <Button variant="outline" className="h-12 rounded-xl border-primary text-base text-primary"><Eye />عرض المنشور على المنصة</Button>
          <Card>
            <h3 className="mb-3 font-bold">التعليقات ({p.comments})</h3>
            <div className="space-y-4">
              {comments.map((c, i) => (
                <div key={i} className="flex gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[var(--blue-light)] font-bold text-[var(--blue)]">{c.name[0]}</span>
                  <div className="flex-1"><p className="font-bold">{c.name}</p><p className="text-sm text-muted-foreground">{c.text}</p><p className="text-xs text-muted-foreground">{c.time}</p></div>
                  <MoreVertical className="size-5 text-muted-foreground" />
                </div>
              ))}
            </div>
            <form className="mt-4 flex items-center gap-2" onSubmit={(e) => { e.preventDefault(); if (!text.trim()) return; setComments([...comments, { name: "أنت", text, time: "الآن" }]); setText(""); }}>
              <input value={text} onChange={(e) => setText(e.target.value)} placeholder="أكتب تعليقك..." className="flex-1 rounded-full border bg-card px-4 py-2 outline-none" />
              <Button size="icon" className="rounded-full" aria-label="إرسال"><Send /></Button>
            </form>
          </Card>
        </>
      )}
    </DetailPage>
  );
}
