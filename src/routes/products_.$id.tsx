import { createFileRoute, Link } from "@tanstack/react-router";
import { CircleCheck, FileText, Link2, Pencil, Star, Trash2 } from "lucide-react";
import { DetailPage, NotFoundBox } from "@/components/detail-page";
import { Card } from "@/components/section-page";
import { Button } from "@/components/ui/button";
import { products } from "@/lib/mock-data";

export const Route = createFileRoute("/products_/$id")({
  head: () => ({
    meta: [
      { title: "MenaFlow | تفاصيل المنتج" },
      { name: "description", content: "عرض تفاصيل المنتج ومحتوياته ومعلوماته." },
      { property: "og:title", content: "MenaFlow | تفاصيل المنتج" },
      { property: "og:description", content: "تفاصيل المنتج في MenaFlow." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ProductDetail,
});

function ProductDetail() {
  const { id } = Route.useParams();
  const p = products.find((x) => x.id === id);
  return (
    <DetailPage title="تفاصيل المنتج" back="/products" active="المنتجات">
      {!p ? <NotFoundBox /> : (
        <>
          <div className="rounded-2xl border bg-[var(--mint-surface)] p-4">
            <div className="product-detail-heading">
              <span className="flex size-32 shrink-0 items-center justify-center rounded-xl bg-card text-primary"><p.icon className="size-16" /></span>
              <div className="flex-1 space-y-2">
                <span className="inline-block rounded-full bg-primary px-3 py-0.5 text-xs text-primary-foreground">{p.type}</span>
                <h2 className="text-lg font-bold">{p.name}</h2>
                <p className="flex items-center gap-1 text-sm"><Star className="size-4 fill-[var(--amber)] text-[var(--amber)]" /><b>{p.rating}</b><span className="text-muted-foreground">({p.reviews} تقييم)</span></p>
                <p className="text-2xl font-bold text-primary" dir="ltr">$ {p.price}</p>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {p.tags.map((t) => <span key={t} className="rounded-full border bg-card px-3 py-1 text-xs text-muted-foreground">{t}</span>)}
            </div>
          </div>
          <p className="px-2 leading-7 text-muted-foreground">{p.desc}</p>
          <Card>
            <h3 className="mb-3 flex items-center gap-2 font-bold"><FileText className="size-5" />محتويات المنتج</h3>
            <ul className="space-y-2">{p.features.map((f) => <li key={f} className="flex items-center gap-2 text-sm"><CircleCheck className="size-5 text-primary" />{f}</li>)}</ul>
          </Card>
          <Card>
            <h3 className="mb-3 flex items-center gap-2 font-bold"><FileText className="size-5" />معلومات إضافية</h3>
            <div className="grid grid-cols-3 text-center text-sm">
              {p.info.map(([k, v]) => <div key={k}><p className="text-muted-foreground">{k}</p><p className="mt-1 font-bold">{v}</p></div>)}
            </div>
          </Card>
          <div className="grid grid-cols-2 gap-3">
            <Button className="h-12 rounded-xl text-base"><Pencil />تعديل</Button>
            <Button variant="destructive" className="h-12 rounded-xl text-base"><Trash2 />حذف المنتج</Button>
          </div>
          <Button asChild variant="outline" className="h-12 rounded-xl border-primary text-base text-primary">
            <Link to="/posts">عرض المنشور على المنصة <Link2 /></Link>
          </Button>
        </>
      )}
    </DetailPage>
  );
}
