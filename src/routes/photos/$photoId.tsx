import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { TopBar } from "@/components/layout/TopBar";
import { PhotoThumb } from "@/components/photos/PhotoThumb";
import { UploadControl } from "@/components/photos/UploadControl";
import { useBlobUrl } from "@/components/photos/useBlobUrl";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { BeforeAfter } from "@/components/workshop/BeforeAfter";
import { getBlob } from "@/lib/storage/photos";
import { deletePhoto, deleteResult, updatePhotoNotes } from "@/lib/storage/photos";
import { useAppStore } from "@/lib/store";
import { getCategory, getTool } from "@/lib/tools/catalog";
import { formatDate } from "@/lib/utils";

export const Route = createFileRoute("/photos/$photoId")({
  component: PhotoDetailPage,
});

function PhotoDetailPage() {
  const { photoId } = Route.useParams();
  const navigate = useNavigate();
  const photos = useAppStore((s) => s.photos);
  const results = useAppStore((s) => s.results);
  const setActivePhotoId = useAppStore((s) => s.setActivePhotoId);
  const photo = photos.find((p) => p.id === photoId);
  const related = results
    .filter((r) => r.photoId === photoId)
    .sort((a, b) => a.generatedAt - b.generatedAt);
  const originalUrl = useBlobUrl(photo?.originalBlobId);
  const [notes, setNotes] = useState("");
  const [compareB, setCompareB] = useState<string>();
  const compareResult = related.find((r) => r.id === (compareB ?? related.at(-1)?.id));
  const compareUrl = useBlobUrl(compareResult?.blobId);

  useEffect(() => {
    setNotes(photo?.notes ?? "");
  }, [photo?.id, photo?.notes]);

  if (!photo) {
    return (
      <div>
        <TopBar title="My Photos" backTo="/photos" />
        <p className="px-5 py-6 text-sm text-muted">That photograph is not in the library.</p>
      </div>
    );
  }

  return (
    <div>
      <TopBar
        title="Original"
        backTo="/photos"
        trailing={
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button
                type="button"
                className="inline-flex size-11 items-center justify-center rounded-lg text-muted"
                aria-label="Delete photograph"
              >
                <Trash2 className="size-4" />
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete this photograph?</AlertDialogTitle>
                <AlertDialogDescription>
                  The original and all results saved against it will be removed from this device.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Keep</AlertDialogCancel>
                <AlertDialogAction
                  onClick={async () => {
                    await deletePhoto(photo.id);
                    setActivePhotoId(null);
                    toast.message("Photograph removed.");
                    void navigate({ to: "/photos" });
                  }}
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        }
      />
      <div className="flex flex-col gap-6 px-5 py-4">
        <div className="overflow-hidden rounded-xl bg-elevated">
          {originalUrl ? (
            <img src={originalUrl} alt={photo.filename ?? "Original photograph"} className="w-full" />
          ) : (
            <div className="aspect-[4/3] bg-elevated" />
          )}
        </div>
        <div className="text-sm text-muted">
          <p>{photo.filename ?? "Untitled photograph"}</p>
          <p className="text-xs text-subtle">
            {formatDate(photo.uploadedAt)} · {photo.width}×{photo.height}
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="notes" className="text-sm font-medium">
            Notes
          </label>
          <Textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Optional notes or tags"
          />
          <Button
            variant="secondary"
            onClick={async () => {
              await updatePhotoNotes(photo.id, notes);
              toast.success("Notes saved.");
            }}
          >
            Save notes
          </Button>
        </div>

        <div className="flex flex-col gap-2">
          <Button
            size="lg"
            className="w-full"
            onClick={() => {
              setActivePhotoId(photo.id);
              void navigate({ to: "/categories" });
            }}
          >
            Edit this photograph
          </Button>
          <UploadControl variant="compact" />
        </div>

        <section>
          <h2 className="font-display text-xl">Versions</h2>
          <p className="mt-1 text-sm text-muted">
            Original is always kept. Each edit is a new version you can export.
          </p>
          {related.length > 0 && originalUrl && compareUrl ? (
            <div className="mt-3 flex flex-col gap-3">
              <label className="text-sm font-medium" htmlFor="compare-b">
                Compare original with
              </label>
              <select
                id="compare-b"
                className="h-11 rounded-xl bg-surface px-3 text-sm shadow-[var(--shadow-border)]"
                value={compareResult?.id ?? ""}
                onChange={(e) => setCompareB(e.target.value)}
              >
                {related.map((result, i) => (
                  <option key={result.id} value={result.id}>
                    Version {i + 1}
                    {i === related.length - 1 ? " · Latest" : ""} — {result.toolName}
                  </option>
                ))}
              </select>
              <BeforeAfter originalUrl={originalUrl} resultUrl={compareUrl} />
            </div>
          ) : null}
          {related.length === 0 ? (
            <p className="mt-2 text-sm text-muted">No results yet. Choose a tool to generate one.</p>
          ) : (
            <ul className="mt-3 flex flex-col gap-3">
              {[...related].reverse().map((result) => {
                const index = related.findIndex((r) => r.id === result.id);
                return (
                <li
                  key={result.id}
                  className="overflow-hidden rounded-xl bg-surface shadow-[var(--shadow-border)]"
                >
                  <div className="aspect-[4/3] bg-elevated">
                    <PhotoThumb blobId={result.thumbBlobId} alt={result.toolName} />
                  </div>
                  <div className="flex flex-col gap-2 p-3">
                    <div>
                      <p className="text-sm font-medium">
                        Version {index + 1}
                        {index === related.length - 1 ? " · Latest" : ""} — {result.toolName}
                      </p>
                      <p className="text-xs text-subtle">{formatDate(result.generatedAt)}</p>
                      <p className="mt-1 text-xs text-muted">
                        {getCategory(getTool(result.toolId)?.category ?? "")?.name ??
                          "Photo Fixer"}{" "}
                        · {result.sourceKind === "result" ? "Continued from a result" : "From original"}
                      </p>
                      {result.extra ? (
                        <p className="mt-1 text-xs text-subtle">Note: {result.extra}</p>
                      ) : null}
                      <details className="mt-2">
                        <summary className="text-xs text-accent">Prompt used</summary>
                        <pre className="mt-1 max-h-32 overflow-auto whitespace-pre-wrap text-xs text-muted">
                          {result.prompt}
                        </pre>
                      </details>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Button asChild variant="secondary" size="sm">
                        <Link
                          to="/workshop/$toolId"
                          params={{ toolId: result.toolId }}
                          search={{ photo: photo.id, from: result.id }}
                        >
                          Continue editing
                        </Link>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={async () => {
                          const blob = await getBlob(result.blobId);
                          if (!blob) return;
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement("a");
                          a.href = url;
                          a.download = `version-${index + 1}.jpg`;
                          a.click();
                          URL.revokeObjectURL(url);
                        }}
                      >
                        Export JPEG
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={async () => {
                          await deleteResult(result.id);
                          toast.message("Version deleted. Original is still here.");
                        }}
                      >
                        Delete version
                      </Button>
                    </div>
                  </div>
                </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
