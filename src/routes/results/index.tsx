import { createFileRoute, Link } from "@tanstack/react-router";
import { PhotoThumb } from "@/components/photos/PhotoThumb";
import { UploadControl } from "@/components/photos/UploadControl";
import { useAppStore } from "@/lib/store";
import { formatDate } from "@/lib/utils";

export const Route = createFileRoute("/results/")({ component: ResultsPage });

function ResultsPage() {
  const results = useAppStore((s) => s.results);
  const photos = useAppStore((s) => s.photos);
  const ready = useAppStore((s) => s.ready);

  return (
    <main>
      <header className="px-5 pt-[calc(env(safe-area-inset-top)+1.25rem)] pb-4">
        <p className="text-xs font-medium tracking-[0.18em] text-accent uppercase">
          Library
        </p>
        <h1 className="mt-1 font-display text-3xl font-medium">Saved Results</h1>
        <p className="mt-1 text-sm text-muted">
          Every generated edit is kept against its original. Originals are never overwritten.
        </p>
      </header>
      <div className="px-5 pb-6">
        <UploadControl variant="compact" />
        {!ready ? (
          <p className="mt-6 text-sm text-muted">Opening saved results…</p>
        ) : results.length === 0 ? (
          <p className="mt-8 text-sm text-muted">
            No saved results yet. Upload a photograph and choose a tool.
          </p>
        ) : (
          <ul className="mt-5 flex flex-col gap-3">
            {results.map((result) => {
              const photo = photos.find((p) => p.id === result.photoId);
              return (
                <li key={result.id}>
                  <Link
                    to="/photos/$photoId"
                    params={{ photoId: result.photoId }}
                    className="flex gap-3 overflow-hidden rounded-xl bg-surface p-2 shadow-[var(--shadow-border)]"
                  >
                    <div className="size-20 shrink-0 overflow-hidden rounded-lg bg-elevated">
                      <PhotoThumb blobId={result.thumbBlobId} alt={result.toolName} />
                    </div>
                    <div className="min-w-0 py-1">
                      <p className="truncate font-medium">{result.toolName}</p>
                      <p className="text-xs text-muted">{formatDate(result.generatedAt)}</p>
                      <p className="mt-1 text-xs text-subtle">
                        {photo?.filename ?? "Original preserved"}
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
