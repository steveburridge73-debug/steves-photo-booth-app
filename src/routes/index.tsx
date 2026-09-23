import { createFileRoute, Link } from "@tanstack/react-router";
import { Aperture } from "lucide-react";
import { UploadControl } from "@/components/photos/UploadControl";
import { PhotoThumb } from "@/components/photos/PhotoThumb";
import { ToolGrid } from "@/components/categories/ToolGrid";
import { ToolSearch } from "@/components/search/ToolSearch";
import { JOBS } from "@/lib/tools/jobs";
import { getTool } from "@/lib/tools/catalog";
import { useAppStore } from "@/lib/store";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const photos = useAppStore((s) => s.photos);
  const results = useAppStore((s) => s.results);
  const activePhotoId = useAppStore((s) => s.activePhotoId);
  const setActivePhotoId = useAppStore((s) => s.setActivePhotoId);
  const recentToolIds = useAppStore((s) => s.recentToolIds);
  const favouriteToolIds = useAppStore((s) => s.favouriteToolIds);
  const active = photos.find((p) => p.id === activePhotoId);
  const recentPhotos = photos.slice(0, 6);
  const favouriteTools = favouriteToolIds
    .map(getTool)
    .filter((tool): tool is NonNullable<typeof tool> => Boolean(tool));
  const recentTools = recentToolIds
    .map(getTool)
    .filter((tool): tool is NonNullable<typeof tool> => Boolean(tool));

  function onUploaded(photoId: string) {
    setActivePhotoId(photoId);
  }

  return (
    <main className="px-5 pt-[calc(env(safe-area-inset-top)+1.5rem)] pb-6">
      <div className="flex items-center gap-2 text-accent">
        <Aperture className="size-5" />
        <p className="text-xs font-medium tracking-[0.18em] uppercase">Steve's Photo Booth</p>
      </div>
      <h1 className="mt-3 font-display text-4xl font-medium">Photo Fixer</h1>
      <p className="mt-2 max-w-[20rem] text-sm text-muted">
        Restore, improve, edit and transform your photographs.
      </p>

      <div className="mt-8">
        <UploadControl onUploaded={onUploaded} />
      </div>

      {active ? (
        <section className="mt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium">Ready to edit</h2>
            <Link to="/photos/$photoId" params={{ photoId: active.id }} className="text-sm text-accent">
              View original
            </Link>
          </div>
          <div className="mt-2 overflow-hidden rounded-xl bg-elevated">
            <div className="aspect-[4/3]">
              <PhotoThumb blobId={active.thumbBlobId} alt={active.filename ?? "Selected photograph"} />
            </div>
          </div>
          <p className="mt-2 text-xs text-subtle">Pick a job. The original stays untouched.</p>
          <ul className="mt-3 grid grid-cols-2 gap-2">
            {JOBS.map((job) => (
              <li key={job.id}>
                {job.kind === "workshop" ? (
                  <Link
                    to="/workshop/$toolId"
                    params={{ toolId: job.target }}
                    className="flex min-h-16 flex-col justify-center rounded-xl bg-surface px-3 py-3 shadow-[var(--shadow-border)]"
                  >
                    <span className="text-sm font-medium">{job.title}</span>
                    <span className="text-xs text-muted">{job.hint}</span>
                  </Link>
                ) : (
                  <Link
                    to="/categories/$categoryId"
                    params={{ categoryId: job.target }}
                    className="flex min-h-16 flex-col justify-center rounded-xl bg-surface px-3 py-3 shadow-[var(--shadow-border)]"
                  >
                    <span className="text-sm font-medium">{job.title}</span>
                    <span className="text-xs text-muted">{job.hint}</span>
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </section>
      ) : (
        <p className="mt-4 text-sm text-muted">Upload a photograph, then pick a job.</p>
      )}

      <section className="mt-8">
        <ToolSearch />
      </section>

      {favouriteTools.length > 0 ? (
        <section className="mt-8">
          <h2 className="text-sm font-medium">Favourites</h2>
          <div className="mt-2">
            <ToolGrid tools={favouriteTools} />
          </div>
        </section>
      ) : null}

      {recentTools.length > 0 ? (
        <section className="mt-8">
          <h2 className="text-sm font-medium">Recently used</h2>
          <div className="mt-2">
            <ToolGrid tools={recentTools} />
          </div>
        </section>
      ) : null}

      <Link
        to="/workshop/$toolId"
        params={{ toolId: "smart-auto-fix" }}
        className="mt-8 flex min-h-16 items-center justify-between rounded-xl bg-accent px-4 py-3 text-accent-fg"
      >
        <span>
          <span className="block font-medium">Smart Auto Fix</span>
          <span className="block text-xs opacity-80">Analyse first. You approve the fixes.</span>
        </span>
        <span className="text-sm">Open</span>
      </Link>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <Link
          to="/workshop/$toolId"
          params={{ toolId: "custom-edit" }}
          className="rounded-xl bg-surface px-3 py-3 text-sm font-medium shadow-[var(--shadow-border)]"
        >
          Custom Prompt
        </Link>
        <Link
          to="/prompts"
          className="rounded-xl bg-surface px-3 py-3 text-sm font-medium shadow-[var(--shadow-border)]"
        >
          Saved Prompts
        </Link>
        <Link
          to="/recipes"
          className="rounded-xl bg-surface px-3 py-3 text-sm font-medium shadow-[var(--shadow-border)]"
        >
          Recipes
        </Link>
        <Link
          to="/batch"
          className="rounded-xl bg-surface px-3 py-3 text-sm font-medium shadow-[var(--shadow-border)]"
        >
          Batch scans
        </Link>
      </div>

      <p className="mt-6 text-center text-sm">
        <Link to="/categories" className="text-accent">
          All categories
        </Link>
      </p>

      {recentPhotos.length > 0 ? (
        <section className="mt-8">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium">Recent photographs</h2>
            <Link to="/photos" className="text-sm text-accent">
              My Photos
            </Link>
          </div>
          <ul className="mt-2 grid grid-cols-3 gap-2">
            {recentPhotos.map((photo) => (
              <li key={photo.id}>
                <Link
                  to="/photos/$photoId"
                  params={{ photoId: photo.id }}
                  className="block overflow-hidden rounded-lg bg-elevated"
                >
                  <div className="aspect-square">
                    <PhotoThumb blobId={photo.thumbBlobId} alt={photo.filename ?? "Photograph"} />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {results.length > 0 ? (
        <p className="mt-6 text-center text-xs text-subtle">
          {results.length} saved result{results.length === 1 ? "" : "s"} in the library.
        </p>
      ) : null}
    </main>
  );
}
