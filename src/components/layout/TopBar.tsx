import { Link, useRouter } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import type { ReactNode } from "react";

export function TopBar({
  title,
  backTo,
  trailing,
}: {
  title: string;
  backTo?: string;
  trailing?: ReactNode;
}) {
  const router = useRouter();

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-2 bg-bg/95 px-3 pt-[env(safe-area-inset-top)]">
      {backTo ? (
        <Link
          to={backTo}
          className="inline-flex size-11 items-center justify-center rounded-lg text-fg"
          aria-label="Back"
        >
          <ChevronLeft className="size-5" />
        </Link>
      ) : (
        <button
          type="button"
          className="inline-flex size-11 items-center justify-center rounded-lg text-fg"
          aria-label="Back"
          onClick={() => router.history.back()}
        >
          <ChevronLeft className="size-5" />
        </button>
      )}
      <h1 className="min-w-0 flex-1 truncate font-display text-lg font-medium">{title}</h1>
      <div className="flex items-center gap-1">{trailing}</div>
    </header>
  );
}
