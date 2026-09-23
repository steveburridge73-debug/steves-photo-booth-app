import { Link, useRouterState } from "@tanstack/react-router";
import { Bookmark, House, Images, LayoutGrid, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const ITEMS = [
  { to: "/", label: "Home", icon: House, match: (p: string) => p === "/" },
  {
    to: "/categories",
    label: "Categories",
    icon: LayoutGrid,
    match: (p: string) => p.startsWith("/categories") || p.startsWith("/workshop"),
  },
  {
    to: "/photos",
    label: "Photos",
    icon: Images,
    match: (p: string) => p.startsWith("/photos"),
  },
  {
    to: "/results",
    label: "Results",
    icon: Bookmark,
    match: (p: string) => p.startsWith("/results"),
  },
  {
    to: "/settings",
    label: "Settings",
    icon: Settings,
    match: (p: string) => p.startsWith("/settings"),
  },
] as const;

export function BottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-bg/95 pb-[env(safe-area-inset-bottom)]"
    >
      <div className="mx-auto grid max-w-lg grid-cols-5">
        {ITEMS.map((item) => {
          const active = item.match(pathname);
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex min-h-14 flex-col items-center justify-center gap-0.5 px-1 text-[11px] font-medium transition-colors duration-150",
                active ? "text-accent" : "text-muted",
              )}
            >
              <Icon className="size-5" strokeWidth={active ? 2.2 : 1.8} />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
