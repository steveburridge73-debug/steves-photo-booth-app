import { CATEGORIES, TOOLS } from "@/lib/tools/catalog";

export const HEALTH_LINKS = [
  { path: "/", label: "Home" },
  { path: "/categories", label: "Categories" },
  { path: "/photos", label: "My Photos" },
  { path: "/results", label: "Saved Results" },
  { path: "/prompts", label: "Saved Prompts" },
  { path: "/recipes", label: "Recipes" },
  { path: "/batch", label: "Batch scans" },
  { path: "/settings", label: "Settings" },
  ...CATEGORIES.map((c) => ({
    path: `/categories/${c.id}`,
    label: c.name,
  })),
] as const;

export type CheckStatus = "pass" | "fail" | "warn";

export type HealthItem = {
  id: string;
  label: string;
  status: CheckStatus;
  detail: string;
};

export function catalogHealth(): HealthItem {
  const active = TOOLS.filter((t) => t.active);
  const broken = active.filter(
    (t) => !t.id || !t.name || !t.mainPrompt || !t.category,
  );
  const ids = new Set(active.map((t) => t.id));
  const duplicate = ids.size !== active.length;
  if (broken.length || duplicate) {
    return {
      id: "catalog",
      label: "Prompt catalogue",
      status: "fail",
      detail: duplicate
        ? "Duplicate tool IDs found."
        : `${broken.length} tools are missing required fields.`,
    };
  }
  return {
    id: "catalog",
    label: "Prompt catalogue",
    status: "pass",
    detail: `${active.length} active tools across ${CATEGORIES.length} categories.`,
  };
}

export async function indexedDbHealth(): Promise<HealthItem> {
  if (typeof indexedDB === "undefined") {
    return {
      id: "idb",
      label: "Photo storage",
      status: "fail",
      detail: "IndexedDB is not available in this browser.",
    };
  }
  try {
    const { openPhotoDb } = await import("@/lib/storage/idb");
    await openPhotoDb();
    return {
      id: "idb",
      label: "Photo storage",
      status: "pass",
      detail: "Local photograph library is ready. Originals stay on this device.",
    };
  } catch (error) {
    return {
      id: "idb",
      label: "Photo storage",
      status: "fail",
      detail: error instanceof Error ? error.message : "Could not open storage.",
    };
  }
}
