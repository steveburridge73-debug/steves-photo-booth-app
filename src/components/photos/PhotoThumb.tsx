import { cn } from "@/lib/utils";
import { useBlobUrl } from "./useBlobUrl";

export function PhotoThumb({
  blobId,
  alt,
  className,
}: {
  blobId: string;
  alt: string;
  className?: string;
}) {
  const url = useBlobUrl(blobId);

  if (!url) {
    return <div className={cn("bg-elevated", className)} aria-hidden />;
  }

  return (
    <img
      src={url}
      alt={alt}
      className={cn("h-full w-full object-cover", className)}
      draggable={false}
    />
  );
}
