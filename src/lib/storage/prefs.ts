const RECENT_KEY = "pf-recent-tools";
const FAV_KEY = "pf-favourite-tools";
const MAX_RECENT = 8;

function readList(key: string): string[] {
  if (typeof localStorage === "undefined") return [];
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.filter((id) => typeof id === "string") : [];
  } catch {
    return [];
  }
}

function writeList(key: string, ids: string[]) {
  localStorage.setItem(key, JSON.stringify(ids));
}

export function readRecentTools() {
  return readList(RECENT_KEY);
}

export function readFavouriteTools() {
  return readList(FAV_KEY);
}

export function pushRecentTool(id: string) {
  const next = [id, ...readList(RECENT_KEY).filter((x) => x !== id)].slice(0, MAX_RECENT);
  writeList(RECENT_KEY, next);
  return next;
}

export function toggleFavouriteTool(id: string) {
  const current = readList(FAV_KEY);
  const next = current.includes(id) ? current.filter((x) => x !== id) : [id, ...current];
  writeList(FAV_KEY, next);
  return next;
}
