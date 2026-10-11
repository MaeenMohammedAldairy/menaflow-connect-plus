import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { ChartNoAxesColumnIncreasing, ChevronRight, FileText, House, Settings, Share2 } from "lucide-react";
import { MenaFlowMark } from "@/components/menaflow-brand";

export function DetailPage({ title, back, active, children }: { title: string; back: "/products" | "/posts" | "/chats" | "/orders"; active: string; children: ReactNode }) {
  const nav = [
    { label: "الرئيسية", icon: House, to: "/" as const },
    { label: "المحتوى", icon: FileText, to: "/posts" as const },
    { label: "المنتجات", icon: Share2, to: "/products" as const },
    { label: "التقارير", icon: ChartNoAxesColumnIncreasing, to: "/" as const },
    { label: "الإعدادات", icon: Settings, to: "/settings" as const },
  ];
  return (
    <main className="dashboard-shell" dir="rtl">
      <header className="shared-title-header py-2">
        <Link to={back} aria-label="رجوع" className="text-foreground">
          <ChevronRight className="size-7" />
        </Link>
        <div className="brand-wordmark" dir="ltr">
          <MenaFlowMark />
          <span>MenaFlow</span>
        </div>
        <span aria-hidden="true" />
      </header>
      <h1 className="py-3 text-center text-2xl font-bold">{title}</h1>
      <div className="flex flex-col gap-3 px-2 pb-6">{children}</div>
      <nav className="bottom-navigation" aria-label="القائمة الرئيسية">
        {nav.map(({ label, icon: I, to }) => (
          <Link key={label} to={to} className={`dashboard-nav-button inline-flex items-center justify-center ${label === active ? "nav-active" : ""}`}>
            <I />
            <span>{label}</span>
          </Link>
        ))}
      </nav>
    </main>
  );
}

export function NotFoundBox() {
  return <p className="py-10 text-center text-muted-foreground">العنصر غير موجود</p>;
}
