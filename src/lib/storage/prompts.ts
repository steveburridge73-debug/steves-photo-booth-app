import { uid } from "@/lib/utils";
import {
  emitDbChange,
  idbDelete,
  idbGet,
  idbGetAll,
  idbPut,
  type SavedPromptRecord,
} from "./idb";

export async function listSavedPrompts(): Promise<SavedPromptRecord[]> {
  const items = await idbGetAll<SavedPromptRecord>("prompts");
  return items.sort((a, b) => b.updatedAt - a.updatedAt);
}

export async function getSavedPrompt(id: string) {
  return idbGet<SavedPromptRecord>("prompts", id);
}

export async function savePrompt(input: {
  name: string;
  category: string;
  sourceToolId?: string;
  prompt: string;
  fields?: Record<string, string>;
  extra?: string;
}): Promise<{ record: SavedPromptRecord; duplicate: boolean }> {
  const existing = await listSavedPrompts();
  const match = existing.find(
    (item) =>
      item.sourceToolId &&
      item.sourceToolId === input.sourceToolId &&
      item.prompt === input.prompt &&
      JSON.stringify(item.fields ?? {}) === JSON.stringify(input.fields ?? {}) &&
      (item.extra ?? "") === (input.extra ?? ""),
  );
  if (match) return { record: match, duplicate: true };

  const now = Date.now();
  const record: SavedPromptRecord = {
    id: uid("prompt"),
    name: input.name.trim() || "Untitled prompt",
    category: input.category.trim() || "Custom",
    sourceToolId: input.sourceToolId,
    prompt: input.prompt,
    fields: input.fields,
    extra: input.extra,
    createdAt: now,
    updatedAt: now,
  };
  await idbPut("prompts", record);
  emitDbChange();
  return { record, duplicate: false };
}

export async function updateSavedPrompt(
  id: string,
  patch: Partial<Pick<SavedPromptRecord, "name" | "category" | "prompt" | "extra" | "fields">>,
) {
  const current = await getSavedPrompt(id);
  if (!current) return;
  await idbPut("prompts", { ...current, ...patch, updatedAt: Date.now() });
  emitDbChange();
}

export async function duplicateSavedPrompt(id: string) {
  const current = await getSavedPrompt(id);
  if (!current) return;
  const now = Date.now();
  const copy: SavedPromptRecord = {
    ...current,
    id: uid("prompt"),
    name: `${current.name} copy`,
    createdAt: now,
    updatedAt: now,
  };
  await idbPut("prompts", copy);
  emitDbChange();
  return copy;
}

export async function deleteSavedPrompt(id: string) {
  await idbDelete("prompts", id);
  emitDbChange();
}
