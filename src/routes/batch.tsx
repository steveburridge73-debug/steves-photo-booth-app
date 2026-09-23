import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { TopBar } from "@/components/layout/TopBar";
import { PhotoThumb } from "@/components/photos/PhotoThumb";
import { ToolSearch } from "@/components/search/ToolSearch";
import { Button } from "@/components/ui/button";
import { editPhotograph } from "@/lib/ai/edit-image";
import { dataUrlToBlob, prepareForEdit } from "@/lib/image/prepare";
import { getBlob, saveResult } from "@/lib/storage/photos";
import { useAppStore } from "@/lib/store";
import { buildPrompt, defaultFieldValues, getTool } from "@/lib/tools";
import { searchTools } from "@/lib/tools/search";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/batch")({ component: BatchPage });

function BatchPage() {
  const photos = useAppStore((s) => s.photos);
  const recordToolUse = useAppStore((s) => s.recordToolUse);
  const refresh = useAppStore((s) => s.refresh);
  const [query, setQuery] = useState("restore");
  const [toolId, setToolId] = useState("restore-photograph");
  const [picked, setPicked] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState("");
  const matches = useMemo(() => searchTools(query), [query]);
  const tool = getTool(toolId);

  function togglePhoto(id: string) {
    setPicked((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 8) {
        toast.message("Up to eight photographs at a time.");
        return prev;
      }
      return [...prev, id];
    });
  }

  async function run() {
    if (!tool || picked.length === 0) return;
    setBusy(true);
    let ok = 0;
    try {
      for (let i = 0; i < picked.length; i++) {
        const photo = photos.find((p) => p.id === picked[i]);
        if (!photo) continue;
        setProgress(`${i + 1} of ${picked.length}`);
        const source = await getBlob(photo.originalBlobId);
        if (!source) continue;
        const prompt = buildPrompt(tool, defaultFieldValues(tool));
        const response = await editPhotograph({
          data: { prompt, images: [await prepareForEdit(source)] },
        });
        if (!response.ok) {
          toast.error(`Stopped at ${photo.filename ?? "a photograph"}: ${response.error}`);
          break;
        }
        const blob = await dataUrlToBlob(response.dataUrl);
        await saveResult({
          photoId: photo.id,
          sourceKind: "original",
          toolId: tool.id,
          toolName: tool.name,
          prompt,
          image: blob,
          notes: "Batch",
        });
        ok += 1;
      }
      recordToolUse(tool.id);
      await refresh();
      if (ok) toast.success(`${ok} new version${ok === 1 ? "" : "s"} saved. Originals unchanged.`);
    } finally {
      setBusy(false);
      setProgress("");
    }
  }

  return (
    <div>
      <TopBar title="Batch" backTo="/" />
      <div className="flex flex-col gap-5 px-5 py-4">
        <p className="text-sm text-muted">
          Same tool, up to eight originals. Each result is a new version.
        </p>
        <div>
          <label htmlFor="batch-tool" className="text-sm font-medium">
            Tool
          </label>
          <Input
            id="batch-tool"
            className="mt-2"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search a tool"
          />
          <ul className="mt-2 flex flex-col gap-1">
            {(matches.length ? matches : tool ? [tool] : []).slice(0, 8).map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => {
                    setToolId(item.id);
                    setQuery(item.name);
                  }}
                  className={cn(
                    "flex min-h-12 w-full items-center rounded-xl px-3 text-left text-sm shadow-[var(--shadow-border)]",
                    item.id === toolId ? "bg-accent text-accent-fg" : "bg-surface",
                  )}
                >
                  {item.name}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-sm font-medium">Photographs · {picked.length} / 8</h2>
          {photos.length === 0 ? (
            <p className="mt-2 text-sm text-muted">Upload scans first, then come back.</p>
          ) : (
            <ul className="mt-2 grid grid-cols-3 gap-2">
              {photos.map((photo) => {
                const on = picked.includes(photo.id);
                return (
                  <li key={photo.id}>
                    <button
                      type="button"
                      onClick={() => togglePhoto(photo.id)}
                      className={cn(
                        "block w-full overflow-hidden rounded-lg bg-elevated",
                        on && "ring-2 ring-accent",
                      )}
                    >
                      <div className="aspect-square">
                        <PhotoThumb blobId={photo.thumbBlobId} alt={photo.filename ?? "Photograph"} />
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <Button size="xl" disabled={busy || !tool || picked.length === 0} onClick={() => void run()}>
          {busy ? `Developing ${progress}…` : `Run ${tool?.name ?? "tool"} on ${picked.length}`}
        </Button>
        <p className="text-center text-xs text-subtle">Smart Auto Fix is one-at-a-time in the workshop.</p>
        <ToolSearch label="Or open a tool instead" />
      </div>
    </div>
  );
}
