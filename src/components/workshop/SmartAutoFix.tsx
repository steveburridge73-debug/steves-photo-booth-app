import { Link, useNavigate } from "@tanstack/react-router";
import { Download, Share2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { TopBar } from "@/components/layout/TopBar";
import { PhotoPicker } from "@/components/photos/PhotoPicker";
import { UploadControl } from "@/components/photos/UploadControl";
import { useBlobUrl } from "@/components/photos/useBlobUrl";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { analyzePhotograph, type PhotoIssue } from "@/lib/ai/analyze-photo";
import { editPhotograph } from "@/lib/ai/edit-image";
import { blobToDataUrl, dataUrlToBlob, prepareForEdit } from "@/lib/image/prepare";
import { makeShareCard } from "@/lib/image/share-card";
import { getBlob, saveResult } from "@/lib/storage/photos";
import { useAppStore } from "@/lib/store";
import { buildPrompt, getTool } from "@/lib/tools";
import { BeforeAfter } from "./BeforeAfter";

export function SmartAutoFixScreen({
  photoId,
  fromResultId,
}: {
  photoId?: string;
  fromResultId?: string;
}) {
  const tool = getTool("smart-auto-fix")!;
  const navigate = useNavigate();
  const setActivePhotoId = useAppStore((s) => s.setActivePhotoId);
  const photos = useAppStore((s) => s.photos);
  const results = useAppStore((s) => s.results);
  const storePhotoId = useAppStore((s) => s.activePhotoId);
  const recordToolUse = useAppStore((s) => s.recordToolUse);
  const activePhotoId = photoId ?? storePhotoId;
  const photo = photos.find((p) => p.id === activePhotoId);

  const [sourceKind, setSourceKind] = useState<"original" | "result">(
    fromResultId ? "result" : "original",
  );
  const [workingResultId, setWorkingResultId] = useState<string | undefined>(fromResultId);
  const [summary, setSummary] = useState<string>();
  const [issues, setIssues] = useState<PhotoIssue[]>([]);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [busy, setBusy] = useState<"analyse" | "apply" | null>(null);
  const [error, setError] = useState<string>();
  const [resultUrl, setResultUrl] = useState<string>();
  const [savedResultId, setSavedResultId] = useState<string>();

  const sourceBlobId = useMemo(() => {
    if (!photo) return undefined;
    if (sourceKind === "result" && workingResultId) {
      const result = results.find((r) => r.id === workingResultId);
      return result?.blobId ?? photo.originalBlobId;
    }
    return photo.originalBlobId;
  }, [photo, sourceKind, workingResultId, results]);

  const sourceUrl = useBlobUrl(sourceBlobId);
  const originalUrl = useBlobUrl(photo?.originalBlobId);

  function onPickPhoto(id: string) {
    setActivePhotoId(id);
    setSummary(undefined);
    setIssues([]);
    setSelected({});
    setResultUrl(undefined);
    setSavedResultId(undefined);
    setSourceKind("original");
    setWorkingResultId(undefined);
    void navigate({
      to: "/workshop/$toolId",
      params: { toolId: "smart-auto-fix" },
      search: { photo: id },
    });
  }

  async function analyse() {
    if (!photo) return;
    setBusy("analyse");
    setError(undefined);
    try {
      const blob = await getBlob(sourceBlobId ?? photo.originalBlobId);
      if (!blob) throw new Error("Could not read the photograph.");
      const image = await prepareForEdit(blob);
      const response = await analyzePhotograph({ data: { image } });
      if (!response.ok) {
        setError(response.error);
        return;
      }
      setSummary(response.summary);
      setIssues(response.issues);
      const next: Record<string, boolean> = {};
      for (const issue of response.issues) next[issue.id] = issue.recommended;
      setSelected(next);
      toast.message("Analysis ready. Choose which fixes to apply.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed.");
    } finally {
      setBusy(null);
    }
  }

  function selectedLabels(allRecommended = false) {
    return issues
      .filter((issue) => (allRecommended ? issue.recommended : selected[issue.id]))
      .map((issue) => `${issue.label}: ${issue.detail}`)
      .join("\n");
  }

  async function apply(allRecommended = false) {
    if (!photo) return;
    const labels = selectedLabels(allRecommended);
    if (!labels) {
      toast.error("Turn on at least one fix, or analyse first.");
      return;
    }
    setBusy("apply");
    setError(undefined);
    try {
      const blob = await getBlob(sourceBlobId ?? photo.originalBlobId);
      if (!blob) throw new Error("Could not read the photograph.");
      const image = await prepareForEdit(blob);
      const fields = { selected: labels };
      const prompt = buildPrompt(tool, fields);
      const response = await editPhotograph({ data: { prompt, images: [image] } });
      if (!response.ok) {
        setError(response.error);
        return;
      }
      const resultBlob = await dataUrlToBlob(response.dataUrl);
      const record = await saveResult({
        photoId: photo.id,
        sourceKind,
        sourceResultId: sourceKind === "result" ? workingResultId : undefined,
        toolId: tool.id,
        toolName: tool.name,
        prompt,
        fields,
        image: resultBlob,
      });
      setResultUrl(await blobToDataUrl(resultBlob));
      setSavedResultId(record.id);
      recordToolUse(tool.id);
      toast.success("Saved as a new version. Original is unchanged.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not apply fixes.");
    } finally {
      setBusy(null);
    }
  }

  function revert() {
    setResultUrl(undefined);
    setSavedResultId(undefined);
    setSourceKind("original");
    setWorkingResultId(undefined);
    toast.message("Showing the original. Saved results are still in My Photos.");
  }

  function undoLast() {
    if (!resultUrl) {
      toast.message("Nothing to undo. The original is already showing.");
      return;
    }
    setResultUrl(undefined);
    setSavedResultId(undefined);
    toast.message("Last preview undone. Saved versions and the original stay.");
  }

  function download(url = resultUrl, name = "smart-auto-fix", format: "jpg" | "png" = "jpg") {
    if (!url) return;
    const a = document.createElement("a");
    a.href = url;
    a.download = `${name}.${format}`;
    a.click();
  }

  async function exportPng(url = resultUrl) {
    if (!url) return;
    const img = new Image();
    img.src = url;
    await img.decode();
    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(img, 0, 0);
    download(canvas.toDataURL("image/png"), "smart-auto-fix", "png");
  }

  async function exportShareCard() {
    const left = originalUrl ?? sourceUrl;
    const right = resultUrl;
    if (!left || !right) return;
    try {
      const card = await makeShareCard(left, right);
      download(card, "smart-auto-fix-card", "jpg");
      toast.success("Before-and-after card ready to share.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not make the card.");
    }
  }

  async function share(url = resultUrl) {
    if (!url) return;
    try {
      const blob = await (await fetch(url)).blob();
      const file = new File([blob], "smart-auto-fix.jpg", { type: blob.type });
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: "Smart Auto Fix" });
      } else {
        toast.message("Use Download to keep the new version.");
      }
    } catch {
      toast.message("Sharing cancelled.");
    }
  }

  return (
    <div>
      <TopBar title="Smart Auto Fix" backTo="/categories/smart" />
      <div className="flex flex-col gap-6 px-5 py-4">
        <div>
          <p className="text-xs font-medium tracking-wide text-accent uppercase">
            Smart Auto Fix
          </p>
          <p className="mt-1 text-sm text-muted">{tool.shortDescription}</p>
          <p className="mt-2 rounded-xl bg-elevated px-3 py-2 text-xs text-muted">
            {tool.note}
          </p>
        </div>

        {!photo ? (
          <section className="flex flex-col gap-4">
            <p className="text-sm">Upload or select a photograph to analyse.</p>
            <UploadControl onUploaded={onPickPhoto} />
            <PhotoPicker onPick={onPickPhoto} />
          </section>
        ) : (
          <>
            <section className="flex flex-col gap-3">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-sm font-medium">Original</h2>
                <UploadControl variant="compact" onUploaded={onPickPhoto} />
              </div>
              <div className="overflow-hidden rounded-xl bg-elevated">
                {sourceUrl ? (
                  <img
                    src={sourceUrl}
                    alt={photo.filename ?? "Photograph"}
                    className="block w-full"
                  />
                ) : (
                  <div className="aspect-[4/3] bg-elevated" />
                )}
              </div>
            </section>

            <Button size="xl" disabled={Boolean(busy)} onClick={() => void analyse()}>
              {busy === "analyse" ? "Analysing…" : "Analyse photo"}
            </Button>

            {summary ? (
              <section className="flex flex-col gap-3">
                <h2 className="font-display text-xl">Photo analysis</h2>
                <p className="text-sm text-muted">{summary}</p>
                {issues.length === 0 ? (
                  <p className="text-sm">No conservative fixes recommended.</p>
                ) : (
                  <div className="flex flex-col gap-2">
                    <h3 className="text-sm font-medium">Recommended fixes</h3>
                    {issues.map((issue) => (
                      <label
                        key={issue.id}
                        className="flex min-h-14 items-start justify-between gap-3 rounded-xl bg-surface px-3 py-3 shadow-[var(--shadow-border)]"
                      >
                        <span>
                          <span className="block text-sm font-medium">{issue.label}</span>
                          <span className="block text-xs text-muted">{issue.detail}</span>
                        </span>
                        <Switch
                          checked={Boolean(selected[issue.id])}
                          onCheckedChange={(on) =>
                            setSelected((prev) => ({ ...prev, [issue.id]: on }))
                          }
                        />
                      </label>
                    ))}
                  </div>
                )}
                <div className="grid grid-cols-1 gap-2">
                  <Button
                    size="xl"
                    disabled={Boolean(busy) || issues.length === 0}
                    onClick={() => void apply(false)}
                  >
                    {busy === "apply" ? "Applying…" : "Apply selected fixes"}
                  </Button>
                  <Button
                    variant="secondary"
                    disabled={Boolean(busy) || !issues.some((i) => i.recommended)}
                    onClick={() => void apply(true)}
                  >
                    Apply all recommended
                  </Button>
                </div>
              </section>
            ) : null}

            {error ? (
              <p className="rounded-xl bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>
            ) : null}

            {resultUrl && (originalUrl || sourceUrl) ? (
              <section className="flex flex-col gap-4">
                <h2 className="font-display text-xl">Compare</h2>
                <BeforeAfter
                  originalUrl={sourceUrl ?? originalUrl ?? resultUrl}
                  resultUrl={resultUrl}
                />
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="secondary" onClick={() => download()}>
                    <Download className="size-4" />
                    Export JPEG
                  </Button>
                  <Button variant="secondary" onClick={() => void exportPng()}>
                    Export PNG
                  </Button>
                </div>
                <Button variant="secondary" onClick={() => void share()}>
                  <Share2 className="size-4" />
                  Share
                </Button>
                <Button variant="outline" onClick={() => void exportShareCard()}>
                  Before / after card
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    if (!savedResultId) return;
                    setSourceKind("result");
                    setWorkingResultId(savedResultId);
                    setResultUrl(undefined);
                    setSummary(undefined);
                    setIssues([]);
                    toast.message("Continue from this version. Original stays safe.");
                  }}
                >
                  Continue editing from this result
                </Button>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" onClick={undoLast}>
                    Undo last
                  </Button>
                  <Button variant="ghost" onClick={revert}>
                    Revert to original
                  </Button>
                </div>
                {savedResultId ? (
                  <p className="text-center text-xs text-muted">
                    Saved as a new version.{" "}
                    <Link
                      to="/photos/$photoId"
                      params={{ photoId: photo.id }}
                      className="text-accent"
                    >
                      View in My Photos
                    </Link>
                  </p>
                ) : null}
              </section>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}
