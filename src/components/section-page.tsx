import { Link } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import {
  ChevronRight,
  FileText,
  House,
  ChartNoAxesColumnIncreasing,
  Settings,
  Share2,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { MenaFlowMark } from "@/components/menaflow-brand";

export function SectionPage({
  icon: Icon,
  tone,
  title,
  description,
  filters,
  active,
  children,
  beforeFilters,
}: {
  icon: LucideIcon;
  tone: "amber" | "violet" | "green";
  title: string;
  description: string;
  filters: string[];
  active: string;
  beforeFilters?: ReactNode;
  children: (filter: string) => ReactNode;
}) {
  const [filter, setFilter] = useState(filters[0]);
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
        <Link to="/" aria-label="رجوع" className="text-foreground">
          <ChevronRight className="size-7" />
        </Link>
        <div className="brand-wordmark" dir="ltr">
          <MenaFlowMark />
          <span>MenaFlow</span>
        </div>
        <span aria-hidden="true" />
      </header>
      <section className="flex flex-col items-center px-4 pt-4 text-center">
        <span className={`stat-icon stat-${tone} !size-20 !rounded-3xl`}>
          <Icon className="!size-11" />
        </span>
        <h1 className="mt-4 text-3xl font-bold">{title}</h1>
        <p className="mt-2 max-w-sm leading-7 text-muted-foreground">{description}</p>
      </section>
      <div className="px-2 pt-5">{beforeFilters}</div>
      <div className="filter-bar">
        {filters.map((f) => (
          <Button variant={filter === f ? "default" : "outline"}
            key={f}
            onClick={() => setFilter(f)}
            className={`shrink-0 rounded-xl border px-4 py-2 text-sm transition ${
              filter === f
                ? "border-primary bg-primary font-semibold text-primary-foreground"
                : "bg-card text-muted-foreground"
            }`}
          >
            {f}
          </Button>
        ))}
      </div>
      <div className="flex flex-col gap-3 px-2 pb-6">{children(filter ?? "الكل")}</div>
      <nav className="bottom-navigation" aria-label="القائمة الرئيسية">
        {nav.map(({ label, icon: I, to }) => (
          <Link
            key={label}
            to={to}
            className={`dashboard-nav-button inline-flex items-center justify-center ${label === active ? "nav-active" : ""}`}
          >
            <I />
            <span>{label}</span>
          </Link>
        ))}
      </nav>
    </main>
  );
}

export function Card({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-2xl border bg-card p-4 shadow-sm">{children}</div>
  );
}
