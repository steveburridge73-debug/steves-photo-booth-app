import { formatDate } from "@/lib/utils";
import { useAppStore } from "@/lib/store";
import { PhotoThumb } from "./PhotoThumb";

export function PhotoPicker({
  onPick,
}: {
  onPick: (photoId: string) => void;
}) {
  const photos = useAppStore((s) => s.photos);

  if (photos.length === 0) {
    return (
      <p className="text-sm text-muted">
        No photographs in the library yet. Upload one to begin.
      </p>
    );
  }

  return (
    <ul className="grid grid-cols-3 gap-2">
      {photos.map((photo) => (
        <li key={photo.id}>
          <button
            type="button"
            onClick={() => onPick(photo.id)}
            className="block w-full overflow-hidden rounded-lg bg-elevated"
          >
            <div className="aspect-square">
              <PhotoThumb blobId={photo.thumbBlobId} alt={photo.filename ?? "Photograph"} />
            </div>
            <span className="sr-only">{formatDate(photo.uploadedAt)}</span>
          </button>
        </li>
      ))}
    </ul>
  );
}
