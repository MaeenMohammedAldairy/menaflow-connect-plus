import { Link } from "@tanstack/react-router";
import { products } from "@/lib/mock-data";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Box, BookOpen, ChevronLeft, Eye, Laptop, Palette, Search, Shirt, ShoppingCart } from "lucide-react";
import { Card, SectionPage } from "@/components/section-page";

export const Route = createFileRoute("/products")({
  head: () => ({
    meta: [
      { title: "MenaFlow | المنتجات" },
      { name: "description", content: "استعرض وادر منتجاتك بسهولة ووصول إلى عملائك في كل مكان." },
      { property: "og:title", content: "MenaFlow | المنتجات" },
      { property: "og:description", content: "إدارة المنتجات الرقمية والمادية والخدمات." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Products,
});

const items = products;

function Products() {
  const [q, setQ] = useState("");
  return (
    <SectionPage
      icon={Box}
      tone="amber"
      title="المنتجات"
      description="استعرض وادر منتجاتك بسهولة، ووصول إلى عملائك في كل مكان"
      filters={["الكل", "منتجات رقمية", "منتجات مادية", "الخدمات"]}
      active="المنتجات"
      beforeFilters={
        <label className="flex items-center gap-2 rounded-xl border bg-card px-4 py-3">
          <Search className="size-5 text-muted-foreground" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="ابحث عن منتج..." className="w-full bg-transparent outline-none" />
        </label>
      }
    >
      {(f) =>
        items
          .filter((i) => (f === "الكل" || i.type === f) && i.name.includes(q))
          .map(({ icon: I, ...i }) => (
            <Link key={i.name} to="/products/$id" params={{ id: i.id }} className="block"><Card>
              <div className="flex items-center gap-4">
                <span className="flex size-20 shrink-0 items-center justify-center rounded-xl bg-[var(--mint-surface)] text-primary">
                  <I className="size-10" />
                </span>
                <div className="flex-1">
                  <h3 className="font-bold">{i.name}</h3>
                  <span className="mt-1 inline-block rounded-md bg-[var(--green-light)] px-2 py-0.5 text-xs text-primary">{i.type}</span>
                  <p className="mt-1 text-lg font-bold text-primary" dir="ltr">$ {i.price}</p>
                  <div className="flex gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><ShoppingCart className="size-3.5" />{i.sales}</span>
                    <span className="flex items-center gap-1"><Eye className="size-3.5" />{i.views}</span>
                  </div>
                </div>
                <ChevronLeft className="text-muted-foreground" />
              </div>
            </Card></Link>
          ))
      }
    </SectionPage>
  );
}
