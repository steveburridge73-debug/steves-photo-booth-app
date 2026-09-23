import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { TopBar } from "@/components/layout/TopBar";
import { PhotoPicker } from "@/components/photos/PhotoPicker";
import { UploadControl } from "@/components/photos/UploadControl";
import { useBlobUrl } from "@/components/photos/useBlobUrl";
import { Button } from "@/components/ui/button";
import { editPhotograph } from "@/lib/ai/edit-image";
import { blobToDataUrl, dataUrlToBlob, prepareForEdit } from "@/lib/image/prepare";
import { getBlob, saveResult } from "@/lib/storage/photos";
import { useAppStore } from "@/lib/store";
import { getRecipe } from "@/lib/tools/recipes";
import { buildPrompt, defaultFieldValues, getTool } from "@/lib/tools";
import { BeforeAfter } from "@/components/workshop/BeforeAfter";

export const Route = createFileRoute("/recipes/$recipeId")({
  component: RecipeRunner,
});

function RecipeRunner() {
  const { recipeId } = Route.useParams();
  const recipe = getRecipe(recipeId);
  if (!recipe) {
    return (
      <div>
        <TopBar title="Recipes" backTo="/recipes" />
        <p className="px-5 py-6 text-sm text-muted">That recipe is not in the list.</p>
      </div>
    );
  }
  return <RecipeBody recipe={recipe} />;
}

function RecipeBody({ recipe }: { recipe: NonNullable<ReturnType<typeof getRecipe>> }) {
  const navigate = useNavigate();
  const photos = useAppStore((s) => s.photos);
  const results = useAppStore((s) => s.results);
  const activePhotoId = useAppStore((s) => s.activePhotoId);
  const setActivePhotoId = useAppStore((s) => s.setActivePhotoId);
  const recordToolUse = useAppStore((s) => s.recordToolUse);
  const refresh = useAppStore((s) => s.refresh);
  const photo = photos.find((p) => p.id === activePhotoId);
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();
  const [lastResultId, setLastResultId] = useState<string>();
  const [previewUrl, setPreviewUrl] = useState<string>();

  const originalUrl = useBlobUrl(photo?.originalBlobId);
  const lastResult = results.find((r) => r.id === lastResultId);
  const sourceUrl = useBlobUrl(lastResult?.blobId) ?? originalUrl;

  const current = recipe.steps[step];
  const tool = current ? getTool(current.toolId) : undefined;

  async function runStep() {
    if (!photo || !tool || !current) return;
    if (tool.id === "smart-auto-fix") {
      void navigate({
        to: "/workshop/$toolId",
        params: { toolId: "smart-auto-fix" },
        search: { photo: photo.id, from: lastResultId },
      });
      return;
    }
    setBusy(true);
    setError(undefined);
    try {
      const sourceBlob = await getBlob(lastResult?.blobId ?? photo.originalBlobId);
      if (!sourceBlob) throw new Error("Could not read the photograph.");
      const prompt = buildPrompt(tool, defaultFieldValues(tool));
      const response = await editPhotograph({
        data: { prompt, images: [await prepareForEdit(sourceBlob)] },
      });
      if (!response.ok) {
        setError(response.error);
        return;
      }
      const blob = await dataUrlToBlob(response.dataUrl);
      const record = await saveResult({
        photoId: photo.id,
        sourceKind: lastResultId ? "result" : "original",
        sourceResultId: lastResultId,
        toolId: tool.id,
        toolName: `${recipe.name} · ${current.label}`,
        prompt,
        image: blob,
        notes: `Recipe ${recipe.name} step ${step + 1}`,
      });
      recordToolUse(tool.id);
      await refresh();
      setLastResultId(record.id);
      setPreviewUrl(await blobToDataUrl(blob));
      toast.success(`${current.label} saved as a new version.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <TopBar title={recipe.name} backTo="/recipes" />
      <div className="flex flex-col gap-5 px-5 py-4">
        <p className="text-sm text-muted">{recipe.description}</p>
        <ol className="flex flex-col gap-1 text-sm">
          {recipe.steps.map((item, i) => (
            <li key={item.toolId} className={i === step ? "font-medium text-accent" : "text-muted"}>
              {i + 1}. {getTool(item.toolId)?.name ?? item.label}
              {i < step ? " · done" : i === step ? " · now" : ""}
            </li>
          ))}
        </ol>

        {!photo ? (
          <div>
            <p className="text-sm text-muted">Choose a photograph first.</p>
            <div className="mt-3">
              <UploadControl onUploaded={setActivePhotoId} />
            </div>
            <div className="mt-4">
              <PhotoPicker onPick={setActivePhotoId} />
            </div>
          </div>
        ) : (
          <>
            {previewUrl && (originalUrl || sourceUrl) ? (
              <BeforeAfter originalUrl={originalUrl ?? sourceUrl ?? previewUrl} resultUrl={previewUrl} />
            ) : sourceUrl ? (
              <img src={sourceUrl} alt="" className="w-full rounded-xl" />
            ) : null}

            {error ? <p className="text-sm text-danger">{error}</p> : null}

            {tool ? (
              <div className="flex flex-col gap-2">
                <Button size="xl" disabled={busy} onClick={() => void runStep()}>
                  {busy ? "Developing…" : `Run ${current.label}`}
                </Button>
                {previewUrl && step < recipe.steps.length - 1 ? (
                  <Button variant="secondary" onClick={() => setStep((s) => s + 1)}>
                    Continue to next step
                  </Button>
                ) : null}
                {previewUrl && step === recipe.steps.length - 1 ? (
                  <p className="text-center text-sm text-muted">Recipe finished. Original is unchanged.</p>
                ) : null}
                <Button asChild variant="outline">
                  <Link
                    to="/workshop/$toolId"
                    params={{ toolId: tool.id }}
                    search={{ photo: photo.id, from: lastResultId }}
                  >
                    Open this step in the workshop
                  </Link>
                </Button>
              </div>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}
