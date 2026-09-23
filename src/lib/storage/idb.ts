const DB_NAME = "steves-photo-booth";
const DB_VERSION = 2;

export type PhotoRecord = {
  id: string;
  filename?: string;
  uploadedAt: number;
  notes?: string;
  tags?: string[];
  width: number;
  height: number;
  mimeType: string;
  originalBlobId: string;
  thumbBlobId: string;
};

export type ResultRecord = {
  id: string;
  photoId: string;
  sourceKind: "original" | "result";
  sourceResultId?: string;
  toolId: string;
  toolName: string;
  prompt: string;
  fields?: Record<string, string>;
  extra?: string;
  generatedAt: number;
  notes?: string;
  blobId: string;
  thumbBlobId: string;
  width: number;
  height: number;
  saved: boolean;
};

export type BlobRecord = {
  id: string;
  blob: Blob;
};

export type SavedPromptRecord = {
  id: string;
  name: string;
  category: string;
  sourceToolId?: string;
  prompt: string;
  fields?: Record<string, string>;
  extra?: string;
  createdAt: number;
  updatedAt: number;
};

function requestToPromise<T>(req: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function txDone(tx: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error ?? new Error("Transaction aborted"));
  });
}

let dbPromise: Promise<IDBDatabase> | null = null;

export function openPhotoDb(): Promise<IDBDatabase> {
  if (typeof indexedDB === "undefined") {
    return Promise.reject(new Error("IndexedDB is not available"));
  }
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains("photos")) {
          const photos = db.createObjectStore("photos", { keyPath: "id" });
          photos.createIndex("by-uploadedAt", "uploadedAt");
        }
        if (!db.objectStoreNames.contains("results")) {
          const results = db.createObjectStore("results", { keyPath: "id" });
          results.createIndex("by-photoId", "photoId");
          results.createIndex("by-generatedAt", "generatedAt");
        }
        if (!db.objectStoreNames.contains("blobs")) {
          db.createObjectStore("blobs", { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains("prompts")) {
          const prompts = db.createObjectStore("prompts", { keyPath: "id" });
          prompts.createIndex("by-updatedAt", "updatedAt");
          prompts.createIndex("by-sourceToolId", "sourceToolId");
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => {
        dbPromise = null;
        reject(req.error);
      };
    });
  }
  return dbPromise;
}

export async function idbPut<T>(store: string, value: T): Promise<void> {
  const db = await openPhotoDb();
  const tx = db.transaction(store, "readwrite");
  tx.objectStore(store).put(value);
  await txDone(tx);
}

export async function idbGet<T>(store: string, key: string): Promise<T | undefined> {
  const db = await openPhotoDb();
  const tx = db.transaction(store, "readonly");
  const value = await requestToPromise(tx.objectStore(store).get(key) as IDBRequest<T>);
  await txDone(tx);
  return value;
}

export async function idbGetAll<T>(store: string): Promise<T[]> {
  const db = await openPhotoDb();
  const tx = db.transaction(store, "readonly");
  const value = await requestToPromise(tx.objectStore(store).getAll() as IDBRequest<T[]>);
  await txDone(tx);
  return value;
}

export async function idbDelete(store: string, key: string): Promise<void> {
  const db = await openPhotoDb();
  const tx = db.transaction(store, "readwrite");
  tx.objectStore(store).delete(key);
  await txDone(tx);
}

export async function idbClear(store: string): Promise<void> {
  const db = await openPhotoDb();
  const tx = db.transaction(store, "readwrite");
  tx.objectStore(store).clear();
  await txDone(tx);
}

export async function idbGetAllByIndex<T>(
  store: string,
  index: string,
  query: IDBValidKey,
): Promise<T[]> {
  const db = await openPhotoDb();
  const tx = db.transaction(store, "readonly");
  const value = await requestToPromise(
    tx.objectStore(store).index(index).getAll(query) as IDBRequest<T[]>,
  );
  await txDone(tx);
  return value;
}

export function emitDbChange() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("pf-db-changed"));
  }
}
