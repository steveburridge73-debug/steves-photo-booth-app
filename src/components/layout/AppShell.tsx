import { Toaster } from "sonner";
import type { ReactNode } from "react";
import { useAppStore } from "@/lib/store";
import { BottomNav } from "./BottomNav";

export function AppShell({ children }: { children: ReactNode }) {
  const theme = useAppStore((s) => s.theme);

  return (
    <div className="min-h-dvh bg-bg text-fg">
      <div className="mx-auto flex min-h-dvh max-w-lg flex-col">
        <div className="flex-1 pb-[calc(6.5rem+env(safe-area-inset-bottom))]">
          {children}
        </div>
        <BottomNav />
      </div>
      <Toaster
        theme={theme}
        position="top-center"
        toastOptions={{
          className: "font-[Outfit] bg-surface text-fg shadow-[var(--shadow-border)]",
        }}
      />
    </div>
  );
}
