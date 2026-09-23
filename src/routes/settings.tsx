import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
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
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { checkAiAvailable } from "@/lib/ai/edit-image";
import { catalogHealth, HEALTH_LINKS, indexedDbHealth, type HealthItem } from "@/lib/health/checks";
import { clearPhotoHistory, clearSavedResults, storageSummary } from "@/lib/storage/photos";
import { useAppStore } from "@/lib/store";
import { CATEGORIES } from "@/lib/tools/catalog";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/settings")({ component: SettingsPage });

function SettingsPage() {
  const theme = useAppStore((s) => s.theme);
  const setTheme = useAppStore((s) => s.setTheme);
  const [summary, setSummary] = useState<{
    photoCount: number;
    resultCount: number;
    quota: { usage: number; quota: number } | null;
  }>();
  const [health, setHealth] = useState<HealthItem[] | null>(null);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    void storageSummary().then(setSummary);
  }, []);

  async function runHealth() {
    setChecking(true);
    try {
      const [idb, ai] = await Promise.all([
        indexedDbHealth(),
        checkAiAvailable()
          .then(
            (res) =>
              ({
                id: "ai",
                label: "AI workshop",
                status: res.available ? "pass" : "warn",
                detail: res.available
                  ? "Image editing is available."
                  : "AI is not available in this environment. Tools and storage still work.",
              }) satisfies HealthItem,
          )
          .catch(
            (): HealthItem => ({
              id: "ai",
              label: "AI workshop",
              status: "warn",
              detail: "Could not reach the AI workshop check.",
            }),
          ),
      ]);
      const links: HealthItem = {
        id: "links",
        label: "Check links",
        status: "pass",
        detail: `${HEALTH_LINKS.length} screens in the map.`,
      };
      setHealth([idb, catalogHealth(), ai, links]);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Health check failed.");
    } finally {
      setChecking(false);
    }
  }

  const quotaLabel = summary?.quota
    ? `${formatBytes(summary.quota.usage)} of ${formatBytes(summary.quota.quota)}`
    : "On this device";

  return (
    <main>
      <header className="px-5 pt-[calc(env(safe-area-inset-top)+1.25rem)] pb-4">
        <p className="text-xs font-medium tracking-[0.18em] text-accent uppercase">
          Photo Fixer
        </p>
        <h1 className="mt-1 font-display text-3xl font-medium">Settings</h1>
      </header>

      <div className="flex flex-col gap-8 px-5 pb-8">
        <section>
          <h2 className="text-sm font-medium">Appearance</h2>
          <div className="mt-3 flex min-h-14 items-center justify-between rounded-xl bg-surface px-4 shadow-[var(--shadow-border)]">
            <div>
              <p className="text-sm font-medium">Light mode</p>
              <p className="text-xs text-muted">Darkroom is the default.</p>
            </div>
            <Switch
              checked={theme === "light"}
              onCheckedChange={(checked) => setTheme(checked ? "light" : "dark")}
              aria-label="Light mode"
            />
          </div>
        </section>

        <section>
          <h2 className="text-sm font-medium">Storage and privacy</h2>
          <div className="mt-3 rounded-xl bg-surface px-4 py-3 text-sm shadow-[var(--shadow-border)]">
            <p>
              Photographs stay on this device. Originals are stored separately from every
              edit and are never overwritten.
            </p>
            <p className="mt-2 text-muted">
              When you generate an edit, the photograph is sent to the AI workshop for that
              one request. It is not shared, posted or used as a social feed.
            </p>
            <p className="mt-3 text-xs text-subtle">
              {summary
                ? `${summary.photoCount} originals · ${summary.resultCount} results · ${quotaLabel}`
                : "Reading storage…"}
            </p>
          </div>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-sm font-medium">Library</h2>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="secondary">Clear saved results</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Clear saved results?</AlertDialogTitle>
                <AlertDialogDescription>
                  Edited images will be removed. Original photographs stay in My Photos.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Keep</AlertDialogCancel>
                <AlertDialogAction
                  onClick={async () => {
                    await clearSavedResults();
                    setSummary(await storageSummary());
                    toast.message("Saved results cleared.");
                  }}
                >
                  Clear results
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">Clear photo history</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Clear all photographs?</AlertDialogTitle>
                <AlertDialogDescription>
                  Originals and results will be deleted from this device. This cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Keep</AlertDialogCancel>
                <AlertDialogAction
                  onClick={async () => {
                    await clearPhotoHistory();
                    useAppStore.getState().setActivePhotoId(null);
                    setSummary(await storageSummary());
                    toast.message("Photo history cleared.");
                  }}
                >
                  Delete everything
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </section>

        <section>
          <h2 className="text-sm font-medium">App health check</h2>
          <Button
            className="mt-3 w-full"
            variant="secondary"
            disabled={checking}
            onClick={() => void runHealth()}
          >
            {checking ? "Checking…" : "Run health check"}
          </Button>
          {health ? (
            <ul className="mt-3 flex flex-col gap-2">
              {health.map((item) => (
                <li
                  key={item.id}
                  className="rounded-xl bg-surface px-4 py-3 shadow-[var(--shadow-border)]"
                >
                  <p className="flex items-center justify-between text-sm font-medium">
                    {item.label}
                    <span
                      className={cn(
                        "text-xs uppercase",
                        item.status === "pass" && "text-accent",
                        item.status === "warn" && "text-muted",
                        item.status === "fail" && "text-danger",
                      )}
                    >
                      {item.status}
                    </span>
                  </p>
                  <p className="mt-1 text-xs text-muted">{item.detail}</p>
                </li>
              ))}
            </ul>
          ) : null}
          <div className="mt-4">
            <p className="text-xs font-medium text-muted">Check links</p>
            <ul className="mt-2 flex flex-col gap-1 text-sm">
              <li>
                <Link to="/" className="text-accent">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/categories" className="text-accent">
                  Categories
                </Link>
              </li>
              <li>
                <Link to="/photos" className="text-accent">
                  My Photos
                </Link>
              </li>
              <li>
                <Link to="/results" className="text-accent">
                  Saved Results
                </Link>
              </li>
              <li>
                <Link to="/prompts" className="text-accent">
                  Saved Prompts
                </Link>
              </li>
              <li>
                <Link to="/recipes" className="text-accent">
                  Recipes
                </Link>
              </li>
              <li>
                <Link to="/batch" className="text-accent">
                  Batch scans
                </Link>
              </li>
              <li>
                <Link to="/workshop/$toolId" params={{ toolId: "custom-edit" }} className="text-accent">
                  Custom Prompt
                </Link>
              </li>
              <li>
                <Link to="/settings" className="text-accent">
                  Settings
                </Link>
              </li>
              {CATEGORIES.map((category) => (
                <li key={category.id}>
                  <Link
                    to="/categories/$categoryId"
                    params={{ categoryId: category.id }}
                    className="text-accent"
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <Separator />

        <section>
          <h2 className="font-display text-xl">About Photo Fixer</h2>
          <p className="mt-2 text-sm text-muted">
            A personal darkroom for restoring, repairing, editing and playfully transforming
            photographs. It is not a social network and not a professional editing suite.
          </p>
          <p className="mt-3 text-xs text-subtle">Steve's Photo Booth · Photo Fixer · v1.0</p>
          <Button asChild variant="ghost" className="mt-2 px-0">
            <Link to="/">Return home</Link>
          </Button>
        </section>
      </div>
    </main>
  );
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
