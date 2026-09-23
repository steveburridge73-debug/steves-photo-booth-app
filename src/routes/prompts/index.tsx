import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Copy, Pencil, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { TopBar } from "@/components/layout/TopBar";
import { UploadControl } from "@/components/photos/UploadControl";
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
import { Input } from "@/components/ui/input";
import {
  deleteSavedPrompt,
  duplicateSavedPrompt,
  listSavedPrompts,
} from "@/lib/storage/prompts";
import type { SavedPromptRecord } from "@/lib/storage/idb";
import { useAppStore } from "@/lib/store";
import { getTool } from "@/lib/tools/catalog";
import { formatDate } from "@/lib/utils";

export const Route = createFileRoute("/prompts/")({ component: SavedPromptsPage });

function SavedPromptsPage() {
  const navigate = useNavigate();
  const activePhotoId = useAppStore((s) => s.activePhotoId);
  const setActivePhotoId = useAppStore((s) => s.setActivePhotoId);
  const [items, setItems] = useState<SavedPromptRecord[]>([]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");

  async function refresh() {
    setItems(await listSavedPrompts());
  }

  useEffect(() => {
    void refresh();
    const onChange = () => void refresh();
    window.addEventListener("pf-db-changed", onChange);
    return () => window.removeEventListener("pf-db-changed", onChange);
  }, []);

  const categories = useMemo(() => {
    const set = new Set(items.map((item) => item.category).filter(Boolean));
    return ["all", ...[...set].sort()];
  }, [items]);

  const filtered = items.filter((item) => {
    const hay = `${item.name} ${item.category} ${item.prompt}`.toLowerCase();
    const q = query.trim().toLowerCase();
    if (q && !hay.includes(q)) return false;
    if (category !== "all" && item.category !== category) return false;
    return true;
  });

  function run(item: SavedPromptRecord) {
    const toolId =
      item.sourceToolId && getTool(item.sourceToolId) ? item.sourceToolId : "custom-edit";
    void navigate({
      to: "/workshop/$toolId",
      params: { toolId },
      search: { photo: activePhotoId ?? undefined, saved: item.id },
    });
  }

  return (
    <div>
      <TopBar title="Saved Prompts" backTo="/categories" />
      <div className="flex flex-col gap-4 px-5 py-4">
        <p className="text-sm text-muted">
          Copies of prompts you like. Built-in tools stay protected.
        </p>
        <div className="flex flex-col gap-2">
          <Button asChild>
            <Link to="/workshop/$toolId" params={{ toolId: "custom-edit" }}>
              Custom Prompt
            </Link>
          </Button>
          <UploadControl
            variant="compact"
            onUploaded={(id) => {
              setActivePhotoId(id);
              toast.message("Photograph ready. Run a saved prompt on it.");
            }}
          />
        </div>
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search saved prompts"
        />
        <div className="flex flex-wrap gap-2">
          {categories.map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => setCategory(name)}
              className={`h-9 rounded-lg px-3 text-sm ${
                category === name ? "bg-accent text-accent-fg" : "bg-surface text-muted"
              }`}
            >
              {name === "all" ? "All" : name}
            </button>
          ))}
        </div>
        {filtered.length === 0 ? (
          <p className="text-sm text-muted">
            No saved prompts yet. Open a tool and tap Save this prompt.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {filtered.map((item) => (
              <li
                key={item.id}
                className="flex flex-col gap-2 rounded-xl bg-surface p-3 shadow-[var(--shadow-border)]"
              >
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-xs text-subtle">
                    {item.category} · {formatDate(item.updatedAt)}
                  </p>
                </div>
                <p className="line-clamp-3 text-xs text-muted">{item.prompt}</p>
                <div className="grid grid-cols-2 gap-2">
                  <Button size="sm" onClick={() => run(item)}>
                    Run on photo
                  </Button>
                  <Button asChild size="sm" variant="secondary">
                    <Link to="/prompts/$promptId" params={{ promptId: item.id }}>
                      <Pencil className="size-4" />
                      Edit
                    </Link>
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={async () => {
                      await duplicateSavedPrompt(item.id);
                      toast.success("Copy saved.");
                    }}
                  >
                    <Copy className="size-4" />
                    Duplicate
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="sm" variant="outline">
                        <Trash2 className="size-4" />
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete this saved prompt?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Built-in tools are not affected. Only this copy is removed.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Keep</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={async () => {
                            await deleteSavedPrompt(item.id);
                            toast.message("Saved prompt deleted.");
                          }}
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
