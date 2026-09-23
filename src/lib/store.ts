import { create } from "zustand";
import {
  listPhotos,
  listResults,
} from "@/lib/storage/photos";
import {
  pushRecentTool,
  readFavouriteTools,
  readRecentTools,
  toggleFavouriteTool,
} from "@/lib/storage/prefs";
import type { PhotoRecord, ResultRecord } from "@/lib/storage/idb";
import { applyTheme, readTheme, writeTheme, type ThemeName } from "@/lib/storage/settings";

type AppState = {
  ready: boolean;
  theme: ThemeName;
  activePhotoId: string | null;
  photos: PhotoRecord[];
  results: ResultRecord[];
  recentToolIds: string[];
  favouriteToolIds: string[];
  hydrate: () => Promise<void>;
  refresh: () => Promise<void>;
  setTheme: (theme: ThemeName) => void;
  setActivePhotoId: (id: string | null) => void;
  recordToolUse: (id: string) => void;
  toggleFavourite: (id: string) => void;
};

const PHOTO_KEY = "pf-active-photo";

function readActivePhoto() {
  if (typeof sessionStorage === "undefined") return null;
  return sessionStorage.getItem(PHOTO_KEY);
}

export const useAppStore = create<AppState>((set, get) => ({
  ready: false,
  theme: "dark",
  activePhotoId: null,
  photos: [],
  results: [],
  recentToolIds: [],
  favouriteToolIds: [],
  hydrate: async () => {
    const theme = readTheme();
    applyTheme(theme);
    const activePhotoId = readActivePhoto();
    set({
      theme,
      activePhotoId,
      recentToolIds: readRecentTools(),
      favouriteToolIds: readFavouriteTools(),
    });
    await get().refresh();
    set({ ready: true });
  },
  refresh: async () => {
    try {
      const [photos, results] = await Promise.all([listPhotos(), listResults()]);
      set({ photos, results });
    } catch {
      set({ photos: [], results: [] });
    }
  },
  setTheme: (theme) => {
    writeTheme(theme);
    set({ theme });
  },
  setActivePhotoId: (id) => {
    if (typeof sessionStorage !== "undefined") {
      if (id) sessionStorage.setItem(PHOTO_KEY, id);
      else sessionStorage.removeItem(PHOTO_KEY);
    }
    set({ activePhotoId: id });
  },
  recordToolUse: (id) => {
    set({ recentToolIds: pushRecentTool(id) });
  },
  toggleFavourite: (id) => {
    set({ favouriteToolIds: toggleFavouriteTool(id) });
  },
}));
