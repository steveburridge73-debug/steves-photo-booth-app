import { useEffect, type ReactNode } from "react";
import { useAppStore } from "@/lib/store";

export function ThemeProvider({ children }: { children: ReactNode }) {
  const hydrate = useAppStore((s) => s.hydrate);
  const refresh = useAppStore((s) => s.refresh);

  useEffect(() => {
    void hydrate();
    const onChange = () => {
      void refresh();
    };
    window.addEventListener("pf-db-changed", onChange);
    return () => window.removeEventListener("pf-db-changed", onChange);
  }, [hydrate, refresh]);

  return children;
}
