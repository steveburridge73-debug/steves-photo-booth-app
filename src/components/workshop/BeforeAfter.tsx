import { useState } from "react";
import { cn } from "@/lib/utils";

type Mode = "after" | "before" | "compare" | "split";

export function BeforeAfter({
  originalUrl,
  resultUrl,
  originalLabel = "Original",
  resultLabel = "Result",
}: {
  originalUrl: string;
  resultUrl: string;
  originalLabel?: string;
  resultLabel?: string;
}) {
  const [mode, setMode] = useState<Mode>("after");
  const [pos, setPos] = useState(50);
  const [zoom, setZoom] = useState(1);

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-4 gap-1 rounded-xl bg-surface p-1 shadow-[var(--shadow-border)]">
        {(
          [
            ["after", "After"],
            ["before", "Before"],
            ["compare", "Slider"],
            ["split", "Side by side"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setMode(id)}
            className={cn(
              "h-9 rounded-lg px-1 text-xs font-medium transition-colors duration-150",
              mode === id ? "bg-elevated text-fg" : "text-muted",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          className="h-9 flex-1 rounded-lg bg-surface text-sm shadow-[var(--shadow-border)]"
          onClick={() => setZoom((z) => Math.min(3, Number((z + 0.5).toFixed(1))))}
        >
          Zoom in
        </button>
        <button
          type="button"
          className="h-9 flex-1 rounded-lg bg-surface text-sm shadow-[var(--shadow-border)]"
          onClick={() => setZoom((z) => Math.max(1, Number((z - 0.5).toFixed(1))))}
        >
          Zoom out
        </button>
        <button
          type="button"
          className="h-9 flex-1 rounded-lg bg-surface text-sm shadow-[var(--shadow-border)]"
          onClick={() => setZoom(1)}
        >
          Fit
        </button>
      </div>

      {mode === "split" ? (
        <div className="grid grid-cols-2 gap-2 overflow-auto" style={{ maxHeight: "70vh" }}>
          <figure className="overflow-hidden rounded-xl bg-elevated">
            <img
              src={originalUrl}
              alt={originalLabel}
              className="w-full max-w-none"
              style={{ width: `${zoom * 100}%` }}
            />
            <figcaption className="px-2 py-1.5 text-center text-xs text-muted">
              {originalLabel}
            </figcaption>
          </figure>
          <figure className="overflow-hidden rounded-xl bg-elevated">
            <img
              src={resultUrl}
              alt={resultLabel}
              className="w-full max-w-none"
              style={{ width: `${zoom * 100}%` }}
            />
            <figcaption className="px-2 py-1.5 text-center text-xs text-muted">
              {resultLabel}
            </figcaption>
          </figure>
        </div>
      ) : (
        <div className="overflow-auto rounded-xl bg-elevated" style={{ maxHeight: "70vh" }}>
          <div className="relative" style={{ width: `${zoom * 100}%` }}>
            {mode === "before" ? (
              <img src={originalUrl} alt={originalLabel} className="block w-full max-w-none" />
            ) : mode === "after" ? (
              <img src={resultUrl} alt={resultLabel} className="block w-full max-w-none" />
            ) : (
              <div className="relative">
                <img src={resultUrl} alt={resultLabel} className="block w-full max-w-none" />
                <div
                  className="absolute inset-0"
                  style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
                >
                  <img
                    src={originalUrl}
                    alt={originalLabel}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div
                  className="pointer-events-none absolute inset-y-0 w-px bg-fg"
                  style={{ left: `${pos}%` }}
                  aria-hidden
                />
                <label className="sr-only" htmlFor="compare-slider">
                  Compare original and result
                </label>
                <input
                  id="compare-slider"
                  type="range"
                  min={0}
                  max={100}
                  value={pos}
                  onChange={(e) => setPos(Number(e.target.value))}
                  className="absolute inset-0 cursor-ew-resize opacity-0"
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
