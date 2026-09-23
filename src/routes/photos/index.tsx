import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { UploadControl } from "@/components/photos/UploadControl";
import { PhotoThumb } from "@/components/photos/PhotoThumb";
import { Input } from "@/components/ui/input";
import { useAppStore } from "@/lib/store";
import { formatDate } from "@/lib/utils";

export const Route = createFileRoute("/photos/")({ component: PhotosPage });

function PhotosPage() {
  const photos = useAppStore((s) => s.photos);
  const results = useAppStore((s) => s.results);
  const ready = useAppStore((s) => s.ready);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return photos;
    return photos.filter((photo) => {
      const related = results.filter((r) => r.photoId === photo.id);
      const hay = [
        photo.filename ?? "",
        photo.notes ?? "",
        ...(photo.tags ?? []),
        formatDate(photo.uploadedAt),
        ...related.map((r) => r.toolName),
        ...related.map((r) => r.notes ?? ""),
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [photos, results, query]);

  return (
    <main>
      <header className="px-5 pt-[calc(env(safe-area-inset-top)+1.25rem)] pb-4">
        <p className="text-xs font-medium tracking-[0.18em] text-accent uppercase">
          Library
        </p>
        <h1 className="mt-1 font-display text-3xl font-medium">My Photos</h1>
        <p className="mt-1 text-sm text-muted">
          Originals only. Edited results live with each photograph and in Saved Results.
        </p>
      </header>
      <div className="px-5 pb-6">
        <UploadControl />
        <label htmlFor="library-search" className="mt-5 block text-sm font-medium">
          Search the library
        </label>
        <Input
          id="library-search"
          className="mt-2"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Notes, filename, tool, date"
        />
        {!ready ? (
          <p className="mt-6 text-sm text-muted">Opening the library…</p>
        ) : photos.length === 0 ? (
          <p className="mt-8 text-sm text-muted">
            No photographs yet. Upload one to start the workshop.
          </p>
        ) : filtered.length === 0 ? (
          <p className="mt-6 text-sm text-muted">Nothing matches that search.</p>
        ) : (
          <ul className="mt-5 grid grid-cols-2 gap-3">
            {filtered.map((photo) => {
              const count = results.filter((r) => r.photoId === photo.id).length;
              return (
                <li key={photo.id}>
                  <Link
                    to="/photos/$photoId"
                    params={{ photoId: photo.id }}
                    className="block overflow-hidden rounded-xl bg-surface shadow-[var(--shadow-border)]"
                  >
                    <div className="aspect-square bg-elevated">
                      <PhotoThumb
                        blobId={photo.thumbBlobId}
                        alt={photo.filename ?? "Photograph"}
                      />
                    </div>
                    <div className="px-2.5 py-2">
                      <p className="truncate text-xs text-muted">{formatDate(photo.uploadedAt)}</p>
                      <p className="truncate text-xs text-subtle">
                        {photo.filename ?? `${count} result${count === 1 ? "" : "s"}`}
                      </p>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </main>
  );
}
