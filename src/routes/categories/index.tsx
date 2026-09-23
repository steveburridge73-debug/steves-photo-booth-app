import { createFileRoute, Link } from "@tanstack/react-router";
import { Bookmark, Pencil } from "lucide-react";
import { UploadControl } from "@/components/photos/UploadControl";
import { PhotoThumb } from "@/components/photos/PhotoThumb";
import { ToolSearch } from "@/components/search/ToolSearch";
import { CATEGORIES } from "@/lib/tools/catalog";
import { ICONS } from "@/lib/tools/icons";
import { toolsForCategory } from "@/lib/tools/catalog";
import { useAppStore } from "@/lib/store";

export const Route = createFileRoute("/categories/")({ component: CategoriesPage });

function CategoriesPage() {
  const photos = useAppStore((s) => s.photos);
  const activePhotoId = useAppStore((s) => s.activePhotoId);
  const active = photos.find((p) => p.id === activePhotoId);

  return (
    <main>
      <header className="px-5 pt-[calc(env(safe-area-inset-top)+1.25rem)] pb-4">
        <p className="text-xs font-medium tracking-[0.18em] text-accent uppercase">
          Photo Fixer
        </p>
        <h1 className="mt-1 font-display text-3xl font-medium">Categories</h1>
        <p className="mt-1 text-sm text-muted">
          Choose what you want to do. Each tool opens the same quiet workshop.
        </p>
      </header>

      <div className="px-5">
        {active ? (
          <div className="mb-5 flex items-center gap-3 rounded-xl bg-surface p-2 shadow-[var(--shadow-border)]">
            <div className="size-14 overflow-hidden rounded-lg bg-elevated">
              <PhotoThumb blobId={active.thumbBlobId} alt="Selected photograph" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">Photograph ready</p>
              <p className="text-xs text-muted">Pick a category, then a tool.</p>
            </div>
            <UploadControl variant="compact" />
          </div>
        ) : (
          <div className="mb-5">
            <UploadControl />
          </div>
        )}

        <div className="mb-5">
          <ToolSearch />
        </div>

        <ul className="flex flex-col gap-2 pb-6">
          <li>
            <Link
              to="/workshop/$toolId"
              params={{ toolId: "custom-edit" }}
              className="flex min-h-16 items-center gap-3 rounded-xl bg-surface px-3 py-3 shadow-[var(--shadow-border)]"
            >
              <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-elevated text-accent">
                <Pencil className="size-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-medium">Custom Prompt</span>
                <span className="block text-sm text-muted">
                  Write your own instruction. Optionally preserve the original.
                </span>
              </span>
            </Link>
          </li>
          <li>
            <Link
              to="/prompts"
              className="flex min-h-16 items-center gap-3 rounded-xl bg-surface px-3 py-3 shadow-[var(--shadow-border)]"
            >
              <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-elevated text-accent">
                <Bookmark className="size-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-medium">Saved Prompts</span>
                <span className="block text-sm text-muted">
                  Favourites and copies. Built-in tools stay protected.
                </span>
              </span>
            </Link>
          </li>
          {CATEGORIES.map((category) => {
            const Icon = ICONS[category.icon];
            const count = toolsForCategory(category.id).length;
            return (
              <li key={category.id}>
                <Link
                  to="/categories/$categoryId"
                  params={{ categoryId: category.id }}
                  className="flex min-h-16 items-center gap-3 rounded-xl bg-surface px-3 py-3 shadow-[var(--shadow-border)]"
                >
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-elevated text-accent">
                    <Icon className="size-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-medium">{category.name}</span>
                    <span className="block text-sm text-muted">{category.description}</span>
                  </span>
                  <span className="text-xs text-subtle tabular-nums">{count}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </main>
  );
}
