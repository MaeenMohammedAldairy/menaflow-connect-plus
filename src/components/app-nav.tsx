import { Link } from "@tanstack/react-router";
import { ChartNoAxesColumnIncreasing, FileText, House, Settings, Workflow } from "lucide-react";

const items = [
  { label: "الرئيسية", icon: House, to: "/" as const },
  { label: "المحتوى", icon: FileText, to: "/posts" as const },
  { label: "المصادر", icon: Workflow, to: "/sources" as const },
  { label: "المنصات", icon: ChartNoAxesColumnIncreasing, to: "/connect-accounts" as const },
  { label: "الإعدادات", icon: Settings, to: "/settings" as const },
];

export function AppNav({ active }: { active: string }) {
  return (
    <nav className="bottom-navigation" aria-label="القائمة الرئيسية">
      {items.map(({ label, icon: I, to }) => (
        <Link
          key={label}
          to={to}
          className={`dashboard-nav-button relative inline-flex items-center justify-center ${label === active ? "nav-active" : ""}`}
        >
          <I />
          <span>{label}</span>
        </Link>
      ))}
    </nav>
  );
}
