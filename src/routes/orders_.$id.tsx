import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarDays, ChevronLeft, CircleCheck, CreditCard, Truck } from "lucide-react";
import { DetailPage, NotFoundBox } from "@/components/detail-page";
import { Card } from "@/components/section-page";
import { orders, products } from "@/lib/mock-data";

export const Route = createFileRoute("/orders_/$id")({
  head: () => ({
    meta: [
      { title: "MenaFlow | تفاصيل الطلب" },
      { name: "description", content: "تفاصيل الطلب والشحن وطريقة الدفع." },
      { property: "og:title", content: "MenaFlow | تفاصيل الطلب" },
      { property: "og:description", content: "تفاصيل الطلب في MenaFlow." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: OrderDetail,
});

function OrderDetail() {
  const { id } = Route.useParams();
  const o = orders.find((x) => x.id === id);
  const p = products.find((x) => x.id === o?.productId);
  return (
    <DetailPage title="تفاصيل الطلب" back="/orders" active="">
      {!o || !p ? <NotFoundBox /> : (
        <>
          <div className="flex items-center gap-3 rounded-2xl border bg-[var(--mint-surface)] p-4">
            <CircleCheck className="size-10 fill-primary text-primary-foreground" />
            <div><p className="font-bold text-primary">{o.status === "ملغاة" ? "تم إلغاء الطلب" : "تم تأكيد الطلب"}</p><p className="text-xs text-muted-foreground">حالة الطلب: {o.status}</p></div>
          </div>
          <Card>
            <div className="flex justify-between text-sm">
              <div><p className="text-muted-foreground">رقم الطلب</p><CalendarDays className="mt-1 size-5 text-primary" /></div>
              <div className="text-left" dir="ltr"><p className="font-bold">#{o.id}</p><p className="text-muted-foreground">{o.date}</p></div>
            </div>
            <Link to="/products/$id" params={{ id: p.id }} className="mt-4 flex items-center gap-3 rounded-xl border p-3">
              <span className="flex size-16 items-center justify-center rounded-lg bg-[var(--mint-surface)] text-primary"><p.icon className="size-8" /></span>
              <div className="flex-1"><p className="font-bold">{p.name}</p><p className="text-xs text-muted-foreground">الكمية: {o.count}</p><p className="font-bold text-primary" dir="ltr">$ {o.total}</p></div>
              <ChevronLeft className="text-muted-foreground" />
            </Link>
            <div className="mt-4 space-y-2 text-sm">
              {[["سعر المنتج", o.total], ["خصم", "0.00"], ["رسوم الدفع", "0.00"]].map(([k, v]) => (
                <div key={k} className="flex justify-between"><span>{k}</span><span dir="ltr">$ {v}</span></div>
              ))}
              <div className="flex justify-between border-t pt-2 text-lg font-bold text-primary"><span>المجموع الكلي</span><span dir="ltr">$ {o.total}</span></div>
            </div>
          </Card>
          <Card>
            <h3 className="mb-3 flex items-center gap-2 font-bold"><Truck className="size-5" />بيانات الشحن</h3>
            <div className="space-y-2 text-sm">
              {[["الاسم", "أحمد محمد"], ["البريد الإلكتروني", "ahmed@example.com"], ["العنوان", "صنعاء، اليمن"]].map(([k, v]) => (
                <div key={k} className="flex justify-between"><span className="text-muted-foreground">{k}</span><span>{v}</span></div>
              ))}
            </div>
          </Card>
          <Card>
            <h3 className="mb-3 flex items-center gap-2 font-bold"><CreditCard className="size-5" />طريقة الدفع</h3>
            <div className="flex items-center justify-between text-sm"><span>بطاقة ائتمان</span><span dir="ltr">VISA **** 4242</span></div>
          </Card>
        </>
      )}
    </DetailPage>
  );
}
