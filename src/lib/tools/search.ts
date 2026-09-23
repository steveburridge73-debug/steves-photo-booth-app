import { getCategory, TOOLS } from "./catalog";
import type { ToolDefinition } from "./types";

const ALIASES: Record<string, string[]> = {
  "fix-red-eye": ["red eye", "redeye"],
  "change-sky": ["sky", "sky replacement"],
  "polaroid-memory": ["polaroid", "instant photo"],
  "expand-photo": ["outpaint", "uncrop", "expand"],
  "passport-photo": ["passport", "visa", "id photo"],
  "hair-colour": ["hair color", "dye hair"],
  "glasses-on-off": ["glasses", "spectacles"],
  "season-change": ["autumn", "winter", "spring garden"],
  "realistic-weather": ["rain", "snow", "weather"],
  "sensor-spots": ["dust spots", "sensor dust"],
  "garden-still-life-autofix": ["garden", "plants", "planters"],
  "album-caption": ["caption", "date stamp"],
  "record-sleeve": ["vinyl", "album cover", "lp"],
  "magazine-cover": ["magazine", "nat geo", "cover"],
  "double-exposure": ["double exposure"],
  "light-leak": ["light leak", "film soup"],
  "newspaper-front": ["newspaper"],
  "pub-sign": ["pub sign"],
  "postage-stamp": ["stamp"],
  "banknote": ["banknote", "money"],
  "anime-still": ["anime"],
  "cctv-still": ["cctv", "security camera"],
  "thermal-view": ["thermal"],
  "clone-me": ["clone", "twin"],
  "smart-auto-fix": ["auto fix", "analyse"],
};

function haystack(tool: ToolDefinition) {
  const cat = getCategory(tool.category)?.name ?? tool.category;
  const aliases = (ALIASES[tool.id] ?? []).join(" ");
  return [
    tool.name,
    tool.shortDescription,
    tool.id,
    cat,
    tool.example ?? "",
    tool.note ?? "",
    aliases,
    ...(tool.fields ?? []).map((f) => f.label),
  ]
    .join(" ")
    .toLowerCase();
}

export function searchTools(query: string): ToolDefinition[] {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return [];
  const words = q.split(/\s+/).filter(Boolean);
  return TOOLS.filter((tool) => {
    if (!tool.active) return false;
    const text = haystack(tool);
    return words.every((word) => text.includes(word));
  }).slice(0, 24);
}
