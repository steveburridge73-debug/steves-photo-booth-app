import { Link, useNavigate } from "@tanstack/react-router";
import { ChevronDown, Download, Share2, Star } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { TopBar } from "@/components/layout/TopBar";
import { PhotoPicker } from "@/components/photos/PhotoPicker";
import { UploadControl } from "@/components/photos/UploadControl";
import { useBlobUrl } from "@/components/photos/useBlobUrl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { editPhotograph } from "@/lib/ai/edit-image";
import { blobToDataUrl, dataUrlToBlob, prepareForEdit } from "@/lib/image/prepare";
import { makeShareCard } from "@/lib/image/share-card";
import { getBlob, saveResult } from "@/lib/storage/photos";
import { getSavedPrompt, savePrompt } from "@/lib/storage/prompts";
import { useAppStore } from "@/lib/store";
import {
  buildPrompt,
  defaultFieldValues,
  getCategory,
  getTool,
  missingRequiredFields,
} from "@/lib/tools";
import { cn } from "@/lib/utils";
import { BeforeAfter } from "./BeforeAfter";
import { ExtraPhotos } from "./ExtraPhotos";
import { SmartAutoFixScreen } from "./SmartAutoFix";

export function WorkshopScreen({
  toolId,
  photoId,
  fromResultId,
  savedPromptId,
}: {
  toolId: string;
  photoId?: string;
  fromResultId?: string;
  savedPromptId?: string;
}) {
  if (toolId === "smart-auto-fix") {
    return <SmartAutoFixScreen photoId={photoId} fromResultId={fromResultId} />;
  }
  return (
    <WorkshopBody
      toolId={toolId}
      photoId={photoId}
      fromResultId={fromResultId}
      savedPromptId={savedPromptId}
    />
  );
}

function WorkshopBody({
  toolId,
  photoId,
  fromResultId,
  savedPromptId,
}: {
  toolId: string;
  photoId?: string;
  fromResultId?: string;
  savedPromptId?: string;
}) {
  const tool = getTool(toolId);
  const navigate = useNavigate();
  const setActivePhotoId = useAppStore((s) => s.setActivePhotoId);
  const photos = useAppStore((s) => s.photos);
  const results = useAppStore((s) => s.results);
  const storePhotoId = useAppStore((s) => s.activePhotoId);
  const recordToolUse = useAppStore((s) => s.recordToolUse);
  const favouriteToolIds = useAppStore((s) => s.favouriteToolIds);
  const toggleFavourite = useAppStore((s) => s.toggleFavourite);
  const activePhotoId = photoId ?? storePhotoId;
  const photo = photos.find((p) => p.id === activePhotoId);

  const [fields, setFields] = useState<Record<string, string>>(
    tool ? defaultFieldValues(tool) : {},
  );
  const [extra, setExtra] = useState("");
  const [extraFiles, setExtraFiles] = useState<File[]>([]);
  const [promptOpen, setPromptOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();
  const [resultUrl, setResultUrl] = useState<string>();
  const [savedResultId, setSavedResultId] = useState<string>();
  const [sourceKind, setSourceKind] = useState<"original" | "result">(
    fromResultId ? "result" : "original",
  );
  const [workingResultId, setWorkingResultId] = useState<string | undefined>(
    fromResultId,
  );
  const [variantResults, setVariantResults] = useState<
    { id: string; url: string; label: string; resultId: string }[]
  >([]);
  const [busyLabel, setBusyLabel] = useState("Developing…");
  const [saveName, setSaveName] = useState(tool?.name ?? "");
  const [saveCategory, setSaveCategory] = useState("");
  const [saveOpen, setSaveOpen] = useState(false);

  useEffect(() => {
    if (!tool || !savedPromptId) return;
    void getSavedPrompt(savedPromptId).then((saved) => {
      if (!saved) return;
      setFields({ ...defaultFieldValues(tool), ...(saved.fields ?? {}) });
      setExtra(saved.extra ?? "");
      setSaveName(saved.name);
      setSaveCategory(saved.category);
      if (tool.id === "custom-edit" && saved.prompt && !saved.fields?.instruction) {
        setFields((prev) => ({ ...prev, instruction: saved.prompt }));
      }
    });
  }, [savedPromptId, tool]);

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
  const isFavourite = tool ? favouriteToolIds.includes(tool.id) : false;

  if (!tool || !tool.active) {
    return (
      <div>
        <TopBar title="Workshop" backTo="/categories" />
        <div className="px-5 py-8">
          <p className="text-muted">That tool is not in the catalogue yet.</p>
          <Button asChild className="mt-4" variant="secondary">
            <Link to="/categories">Back to categories</Link>
          </Button>
        </div>
      </div>
    );
  }

  const category = getCategory(tool.category);
  const prompt = buildPrompt(tool, fields, extra);
  const promptPreview =
    tool.variants && tool.variants.length > 0
      ? tool.variants
          .map((variant) => `${variant.label}\n\n${buildPrompt(tool, fields, extra, variant)}`)
          .join("\n\n————\n\n")
      : prompt;
  const missing = missingRequiredFields(tool, fields);

  function onPickPhoto(id: string) {
    setActivePhotoId(id);
    setResultUrl(undefined);
    setSavedResultId(undefined);
    setVariantResults([]);
    setSourceKind("original");
    setWorkingResultId(undefined);
    void navigate({
      to: "/workshop/$toolId",
      params: { toolId },
      search: { photo: id },
    });
  }

  async function generate(opts?: { simpler?: boolean }) {
    if (!photo || !tool) return;
    if (missing.length) {
      toast.error(`Please fill in: ${missing.join(", ")}`);
      return;
    }
    const extraText = opts?.simpler
      ? [
          extra.trim(),
          "Try a simpler, more conservative version of the same request. Change less. Do not invent detail. If unsure, stay closer to the original photograph.",
        ]
          .filter(Boolean)
          .join("\n")
      : extra;
    setBusy(true);
    setError(undefined);
    try {
      const sourceBlob = await getBlob(sourceBlobId ?? photo.originalBlobId);
      if (!sourceBlob) throw new Error("Could not read the photograph.");
      const images = [await prepareForEdit(sourceBlob)];
      for (const file of extraFiles.slice(0, tool.extraImages ?? 0)) {
        images.push(await prepareForEdit(file));
      }

      const jobs =
        tool.variants && tool.variants.length > 0
          ? tool.variants.map((variant) => ({
              prompt: buildPrompt(tool, fields, extraText, variant),
              toolName: `${tool.name} · ${variant.label}`,
              label: variant.label,
              notes: variant.label,
            }))
          : [
              {
                prompt: buildPrompt(tool, fields, extraText),
                toolName: tool.name,
                label: "Result",
                notes: undefined as string | undefined,
              },
            ];

      const made: { id: string; url: string; label: string; resultId: string }[] = [];
      for (let i = 0; i < jobs.length; i++) {
        const job = jobs[i];
        setBusyLabel(
          jobs.length > 1
            ? `Developing version ${i + 1} of ${jobs.length}…`
            : opts?.simpler
              ? "Trying a simpler version…"
              : "Developing…",
        );
        const response = await editPhotograph({ data: { prompt: job.prompt, images } });
        if (!response.ok) {
          setError(response.error);
          if (made.length) setVariantResults(made);
          return;
        }
        const resultBlob = await dataUrlToBlob(response.dataUrl);
        const record = await saveResult({
          photoId: photo.id,
          sourceKind,
          sourceResultId: sourceKind === "result" ? workingResultId : undefined,
          toolId: tool.id,
          toolName: job.toolName,
          prompt: job.prompt,
          fields,
          extra: extraText.trim() || undefined,
          image: resultBlob,
          notes: job.notes,
        });
        const preview = await blobToDataUrl(resultBlob);
        made.push({
          id: job.label,
          url: preview,
          label: job.label,
          resultId: record.id,
        });
      }

      if (jobs.length > 1) {
        setVariantResults(made);
        setResultUrl(undefined);
        setSavedResultId(undefined);
        toast.success("Both restorations saved. Original is unchanged.");
      } else {
        setVariantResults([]);
        setResultUrl(made[0]?.url);
        setSavedResultId(made[0]?.resultId);
        toast.success("Saved as a new result. Original is unchanged.");
      }
      recordToolUse(tool.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
      setBusyLabel("Developing…");
    }
  }

  function download(url = resultUrl, name = tool?.id ?? "result", format: "jpg" | "png" = "jpg") {
    if (!url) return;
    const a = document.createElement("a");
    a.href = url;
    a.download = `${name}.${format}`;
    a.click();
  }

  async function exportPng(url = resultUrl, name = tool?.id ?? "result") {
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
    const png = canvas.toDataURL("image/png");
    download(png, name, "png");
  }

  async function exportShareCard(rightUrl?: string) {
    const left = originalUrl ?? sourceUrl;
    const right = rightUrl ?? resultUrl;
    if (!left || !right) return;
    try {
      const card = await makeShareCard(left, right);
      download(card, `${tool?.id ?? "compare"}-card`, "jpg");
      toast.success("Before-and-after card ready to share.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not make the card.");
    }
  }

  async function share(url = resultUrl, title = tool?.name) {
    if (!url || !navigator.share) {
      toast.message("Use Download to keep a copy.");
      return;
    }
    try {
      const blob = await dataUrlToBlob(url);
      const file = new File([blob], `${tool?.id ?? "result"}.jpg`, {
        type: blob.type || "image/jpeg",
      });
      await navigator.share({ title, files: [file] });
    } catch {
      toast.message("Share cancelled.");
    }
  }

  function useOriginalAsSource() {
    setSourceKind("original");
    setWorkingResultId(undefined);
    setResultUrl(undefined);
    setSavedResultId(undefined);
    setVariantResults([]);
  }

  function revertToOriginal() {
    useOriginalAsSource();
    toast.message("Showing the original. Saved results are still in My Photos.");
  }

  function undoLast() {
    if (!resultUrl && variantResults.length === 0) {
      toast.message("Nothing to undo. The original is already showing.");
      return;
    }
    setResultUrl(undefined);
    setVariantResults([]);
    setSavedResultId(undefined);
    toast.message("Last preview undone. Saved versions and the original stay.");
  }

  function useResultAsSource(resultId?: string) {
    const id = resultId ?? savedResultId;
    if (!id) return;
    setSourceKind("result");
    setWorkingResultId(id);
    setResultUrl(undefined);
    setSavedResultId(undefined);
    setVariantResults([]);
    toast.message("Next edit starts from this version. Original is unchanged.");
  }

  async function saveCurrentPrompt() {
    if (!tool) return;
    const built = buildPrompt(tool, fields, extra);
    const result = await savePrompt({
      name: saveName.trim() || tool.name,
      category: saveCategory.trim() || category?.name || "Custom",
      sourceToolId: tool.id,
      prompt: built,
      fields,
      extra: extra.trim() || undefined,
    });
    if (result.duplicate) {
      toast.message("That prompt is already in Saved Prompts.");
    } else {
      toast.success("Prompt saved. Built-in tools stay unchanged.");
    }
    setSaveOpen(false);
  }

  return (
    <div>
      <TopBar
        title={tool.name}
        backTo={category ? `/categories/${category.id}` : "/categories"}
        trailing={
          <button
            type="button"
            aria-label={isFavourite ? "Remove from favourites" : "Add to favourites"}
            aria-pressed={isFavourite}
            onClick={() => toggleFavourite(tool.id)}
            className="inline-flex size-11 items-center justify-center"
          >
            <Star
              className={cn("size-5", isFavourite && "fill-accent text-accent")}
              strokeWidth={isFavourite ? 2.2 : 1.8}
            />
          </button>
        }
      />
      <div className="flex flex-col gap-6 px-5 py-4">
        <div>
          <p className="text-xs font-medium tracking-wide text-accent uppercase">
            {category?.name}
          </p>
          <p className="mt-1 text-sm text-muted">{tool.shortDescription}</p>
          {tool.note ? (
            <p className="mt-2 rounded-xl bg-elevated px-3 py-2 text-xs text-muted">
              {tool.note}
            </p>
          ) : null}
        </div>

        {!photo ? (
          <section className="flex flex-col gap-4">
            <p className="text-sm text-fg">Upload or select a photograph to begin.</p>
            <UploadControl onUploaded={onPickPhoto} />
            <div>
              <h2 className="mb-2 text-sm font-medium">From My Photos</h2>
              <PhotoPicker onPick={onPickPhoto} />
            </div>
          </section>
        ) : (
          <>
            <section className="flex flex-col gap-3">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-sm font-medium">
                  {sourceKind === "result" ? "Starting from a result" : "Original"}
                </h2>
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
              {sourceKind === "result" ? (
                <Button variant="ghost" onClick={useOriginalAsSource}>
                  Use the original instead
                </Button>
              ) : null}
            </section>

            {tool.fields && tool.fields.length > 0 ? (
              <section className="flex flex-col gap-4">
                {tool.fields.map((field) => (
                  <div key={field.id} className="flex flex-col gap-1.5">
                    <Label htmlFor={field.type === "toggles" ? undefined : field.id}>
                      {field.label}
                      {!field.required && field.type !== "toggles" ? (
                        <span className="font-normal text-subtle"> optional</span>
                      ) : null}
                    </Label>
                    {field.help ? (
                      <p className="text-xs text-subtle">{field.help}</p>
                    ) : null}
                    {field.type === "toggles" ? (
                      <div className="flex flex-col gap-2">
                        {(field.options ?? []).map((opt) => {
                          const on = (fields[field.id] ?? "")
                            .split("\n")
                            .includes(opt.value);
                          return (
                            <label
                              key={opt.value}
                              className="flex min-h-12 items-center justify-between gap-3 rounded-xl bg-surface px-3 py-2 shadow-[var(--shadow-border)]"
                            >
                              <span className="text-sm">{opt.label}</span>
                              <Switch
                                checked={on}
                                onCheckedChange={() => {
                                  setFields((prev) => {
                                    const set = new Set(
                                      (prev[field.id] ?? "")
                                        .split("\n")
                                        .filter(Boolean),
                                    );
                                    if (set.has(opt.value)) set.delete(opt.value);
                                    else set.add(opt.value);
                                    return { ...prev, [field.id]: [...set].join("\n") };
                                  });
                                }}
                              />
                            </label>
                          );
                        })}
                      </div>
                    ) : field.type === "textarea" ? (
                      <Textarea
                        id={field.id}
                        value={fields[field.id] ?? ""}
                        placeholder={field.placeholder}
                        onChange={(e) =>
                          setFields((prev) => ({ ...prev, [field.id]: e.target.value }))
                        }
                      />
                    ) : field.type === "select" ? (
                      <select
                        id={field.id}
                        className="h-11 rounded-xl bg-surface px-3 text-sm shadow-[var(--shadow-border)]"
                        value={fields[field.id] ?? ""}
                        onChange={(e) =>
                          setFields((prev) => ({ ...prev, [field.id]: e.target.value }))
                        }
                      >
                        {(field.options ?? []).map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <Input
                        id={field.id}
                        value={fields[field.id] ?? ""}
                        placeholder={field.placeholder}
                        onChange={(e) =>
                          setFields((prev) => ({ ...prev, [field.id]: e.target.value }))
                        }
                      />
                    )}
                  </div>
                ))}
              </section>
            ) : null}

            {tool.extraImages ? (
              <ExtraPhotos
                max={tool.extraImages}
                files={extraFiles}
                onChange={setExtraFiles}
              />
            ) : null}

            {tool.example ? (
              <p className="text-xs text-subtle">Example: {tool.example}</p>
            ) : null}

            <section className="flex flex-col gap-2">
              <Label htmlFor="extra">Anything else</Label>
              <Textarea
                id="extra"
                value={extra}
                placeholder="Optional extra instruction"
                onChange={(e) => setExtra(e.target.value)}
              />
            </section>

            <button
              type="button"
              onClick={() => setPromptOpen((v) => !v)}
              className="flex items-center justify-between rounded-xl bg-surface px-3 py-3 text-left text-sm shadow-[var(--shadow-border)]"
            >
              <span>Review the prompt</span>
              <ChevronDown className={cn("size-4", promptOpen && "rotate-180")} />
            </button>
            {promptOpen ? (
              <pre className="max-h-48 overflow-auto whitespace-pre-wrap rounded-xl bg-elevated p-3 text-xs text-muted">
                {promptPreview}
              </pre>
            ) : null}

            {error ? (
              <p className="rounded-xl bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>
            ) : null}

            <section className="flex flex-col gap-2">
              <Button type="button" variant="secondary" onClick={() => setSaveOpen((v) => !v)}>
                Save this prompt
              </Button>
              {saveOpen ? (
                <div className="flex flex-col gap-2 rounded-xl bg-surface p-3 shadow-[var(--shadow-border)]">
                  <Label htmlFor="save-name">Name</Label>
                  <Input
                    id="save-name"
                    value={saveName}
                    onChange={(e) => setSaveName(e.target.value)}
                    placeholder={tool.name}
                  />
                  <Label htmlFor="save-cat">Category</Label>
                  <Input
                    id="save-cat"
                    value={saveCategory}
                    onChange={(e) => setSaveCategory(e.target.value)}
                    placeholder={category?.name ?? "Custom"}
                  />
                  <p className="text-xs text-subtle">
                    Built-in tools are never overwritten. This saves a copy you can edit later.
                  </p>
                  <Button onClick={() => void saveCurrentPrompt()}>Save to Saved Prompts</Button>
                </div>
              ) : null}
            </section>

            <Button size="xl" disabled={busy} onClick={() => void generate()}>
              {busy
                ? busyLabel
                : resultUrl || variantResults.length
                  ? tool.category === "autofix"
                    ? "Try another Autofix"
                    : tool.category === "rescue"
                      ? "Try another rescue"
                      : "Try another version"
                  : tool.variants && tool.variants.length > 1
                    ? "Generate both restorations"
                    : tool.category === "autofix"
                      ? "Autofix"
                      : tool.category === "rescue"
                        ? "Rescue"
                        : "Generate"}
            </Button>
            <Button
              variant="outline"
              disabled={busy}
              onClick={() => void generate({ simpler: true })}
            >
              Try again, simpler
            </Button>
            <p className="text-center text-xs text-subtle">
              Review the prompt above. Generate saves a new version — the original is never overwritten.
            </p>

            {busy ? (
              <p className="text-center text-sm text-muted">
                Working in the darkroom. This can take a little while.
              </p>
            ) : null}

            {variantResults.length > 0 && (originalUrl || sourceUrl) ? (
              <section className="flex flex-col gap-6">
                <h2 className="font-display text-xl">Compare</h2>
                <p className="text-sm text-muted">
                  Original on the left of each slider. Each version is saved separately.
                </p>
                {variantResults.map((item) => (
                  <div key={item.resultId} className="flex flex-col gap-3">
                    <h3 className="text-sm font-medium">{item.label}</h3>
                    <BeforeAfter
                      originalUrl={originalUrl ?? sourceUrl ?? item.url}
                      resultUrl={item.url}
                      resultLabel={item.label}
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant="secondary"
                        onClick={() => download(item.url, item.id)}
                      >
                        <Download className="size-4" />
                        Export JPEG
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() => void exportPng(item.url, item.id)}
                      >
                        Export PNG
                      </Button>
                    </div>
                    <Button variant="secondary" onClick={() => void share(item.url, item.label)}>
                      <Share2 className="size-4" />
                      Share
                    </Button>
                    <Button variant="outline" onClick={() => void exportShareCard(item.url)}>
                      Before / after card
                    </Button>
                    <Button variant="outline" onClick={() => useResultAsSource(item.resultId)}>
                      Edit again from this version
                    </Button>
                  </div>
                ))}
                {sourceKind === "result" ? (
                  <Button variant="ghost" onClick={useOriginalAsSource}>
                    View original and start again
                  </Button>
                ) : null}
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" onClick={undoLast}>
                    Undo last
                  </Button>
                  <Button variant="ghost" onClick={revertToOriginal}>
                    Revert to original
                  </Button>
                </div>
                <p className="text-center text-xs text-muted">
                  Saved against this original.{" "}
                  <Link
                    to="/photos/$photoId"
                    params={{ photoId: photo.id }}
                    className="text-accent"
                  >
                    View in My Photos
                  </Link>
                </p>
              </section>
            ) : null}

            {resultUrl && variantResults.length === 0 && (originalUrl || sourceUrl) ? (
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
                <Button variant="outline" onClick={() => useResultAsSource()}>
                  Edit again from this result
                </Button>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" onClick={undoLast}>
                    Undo last
                  </Button>
                  <Button variant="ghost" onClick={revertToOriginal}>
                    Revert to original
                  </Button>
                </div>
                {savedResultId ? (
                  <p className="text-center text-xs text-muted">
                    Saved against this original.{" "}
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
