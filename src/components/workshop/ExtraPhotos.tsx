import { useEffect, useMemo, useRef } from "react";
import { Button } from "@/components/ui/button";

export function ExtraPhotos({
  max,
  files,
  onChange,
}: {
  max: number;
  files: File[];
  onChange: (files: File[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const urls = useMemo(() => files.map((file) => URL.createObjectURL(file)), [files]);

  useEffect(() => {
    return () => {
      for (const url of urls) URL.revokeObjectURL(url);
    };
  }, [urls]);

  function add(list: FileList | null) {
    if (!list) return;
    const next = [...files, ...Array.from(list)].slice(0, max);
    onChange(next);
    if (inputRef.current) inputRef.current.value = "";
  }

  function move(index: number, dir: -1 | 1) {
    const next = [...files];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    const item = next[index];
    next[index] = next[target];
    next[target] = item;
    onChange(next);
  }

  function remove(index: number) {
    onChange(files.filter((_, i) => i !== index));
  }

  return (
    <section className="flex flex-col gap-2">
      <p className="text-sm font-medium">
        Extra photographs ({files.length}/{max})
      </p>
      <p className="text-xs text-subtle">
        Thumbnails below. Reorder if you like. Originals are not overwritten.
      </p>
      {files.length > 0 ? (
        <ul className="flex flex-col gap-2">
          {files.map((file, index) => (
            <li
              key={`${file.name}-${file.lastModified}-${index}`}
              className="flex items-center gap-3 rounded-xl bg-surface p-2 shadow-[var(--shadow-border)]"
            >
              <img
                src={urls[index]}
                alt={file.name}
                className="size-14 shrink-0 rounded-lg object-cover"
              />
              <span className="min-w-0 flex-1 truncate text-sm">{file.name}</span>
              <div className="flex shrink-0 gap-1">
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  disabled={index === 0}
                  onClick={() => move(index, -1)}
                >
                  Up
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  disabled={index === files.length - 1}
                  onClick={() => move(index, 1)}
                >
                  Down
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => remove(index)}
                >
                  Remove
                </Button>
              </div>
            </li>
          ))}
        </ul>
      ) : null}
      {files.length < max ? (
        <>
          <input
            ref={inputRef}
            id="extra-images"
            type="file"
            accept="image/*"
            multiple
            className="sr-only"
            onChange={(e) => add(e.target.files)}
          />
          <Button
            type="button"
            variant="secondary"
            onClick={() => inputRef.current?.click()}
          >
            Add photographs
          </Button>
        </>
      ) : null}
    </section>
  );
}
