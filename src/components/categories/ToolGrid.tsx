import { Link } from "@tanstack/react-router";
import { Star } from "lucide-react";
import { ICONS } from "@/lib/tools/icons";
import { useAppStore } from "@/lib/store";
import type { ToolDefinition } from "@/lib/tools/types";
import { cn } from "@/lib/utils";

export function ToolGrid({ tools }: { tools: ToolDefinition[] }) {
  const favouriteToolIds = useAppStore((s) => s.favouriteToolIds);
  const toggleFavourite = useAppStore((s) => s.toggleFavourite);

  if (tools.length === 0) {
    return <p className="text-sm text-muted">Tools for this section will arrive next.</p>;
  }

  return (
    <ul className="flex flex-col gap-2">
      {tools.map((tool) => {
        const Icon = ICONS[tool.icon];
        const fave = favouriteToolIds.includes(tool.id);
        return (
          <li key={tool.id} className="relative">
            <Link
              to="/workshop/$toolId"
              params={{ toolId: tool.id }}
              className="flex min-h-16 items-center gap-3 rounded-xl bg-surface py-3 pr-12 pl-3 shadow-[var(--shadow-border)] transition-colors duration-150 active:bg-elevated"
            >
              <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-elevated text-accent">
                <Icon className="size-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-medium text-fg">{tool.name}</span>
                <span className="block text-sm text-muted">{tool.shortDescription}</span>
              </span>
            </Link>
            <button
              type="button"
              aria-label={fave ? `Remove ${tool.name} from favourites` : `Favourite ${tool.name}`}
              aria-pressed={fave}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleFavourite(tool.id);
              }}
              className="absolute top-1/2 right-2 flex size-11 -translate-y-1/2 items-center justify-center text-muted"
            >
              <Star
                className={cn("size-5", fave && "fill-accent text-accent")}
                strokeWidth={fave ? 2.2 : 1.8}
              />
            </button>
          </li>
        );
      })}
    </ul>
  );
}
