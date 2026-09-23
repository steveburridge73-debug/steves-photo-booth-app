import { Camera, ImageUp } from "lucide-react";
import { useRef, useState, type ChangeEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { addPhotoFromFile } from "@/lib/storage/photos";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export function UploadControl({
  variant = "full",
  onUploaded,
  className,
}: {
  variant?: "full" | "compact" | "camera";
  onUploaded?: (photoId: string) => void;
  className?: string;
}) {
  const galleryRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const setActivePhotoId = useAppStore((s) => s.setActivePhotoId);

  async function handleFiles(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose a photograph.");
      return;
    }
    setBusy(true);
    try {
      const photo = await addPhotoFromFile(file);
      setActivePhotoId(photo.id);
      onUploaded?.(photo.id);
      toast.success("Photograph ready.");
    } catch {
      toast.error("Could not store that photograph.");
    } finally {
      setBusy(false);
      if (galleryRef.current) galleryRef.current.value = "";
      if (cameraRef.current) cameraRef.current.value = "";
    }
  }

  function onChange(event: ChangeEvent<HTMLInputElement>) {
    void handleFiles(event.target.files);
  }

  return (
    <div className={cn("relative flex flex-col gap-2", className)}>
      <input
        ref={galleryRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={onChange}
      />
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="sr-only"
        onChange={onChange}
      />
      {variant === "full" ? (
        <>
          <Button
            size="xl"
            disabled={busy}
            onClick={() => galleryRef.current?.click()}
          >
            <ImageUp className="size-5" />
            {busy ? "Preparing…" : "Upload Photo"}
          </Button>
          <Button
            variant="secondary"
            size="lg"
            className="w-full"
            disabled={busy}
            onClick={() => cameraRef.current?.click()}
          >
            <Camera className="size-4" />
            Take a photo
          </Button>
        </>
      ) : variant === "camera" ? (
        <Button
          variant="secondary"
          disabled={busy}
          onClick={() => cameraRef.current?.click()}
        >
          <Camera className="size-4" />
          Camera
        </Button>
      ) : (
        <Button
          variant="outline"
          disabled={busy}
          onClick={() => galleryRef.current?.click()}
        >
          <ImageUp className="size-4" />
          {busy ? "Preparing…" : "Upload another"}
        </Button>
      )}
    </div>
  );
}
