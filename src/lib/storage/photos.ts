import { makeThumb, measureBlob, prepareOriginal } from "@/lib/image/prepare";
import { uid } from "@/lib/utils";
import {
  emitDbChange,
  idbClear,
  idbDelete,
  idbGet,
  idbGetAll,
  idbGetAllByIndex,
  idbPut,
  type BlobRecord,
  type PhotoRecord,
  type ResultRecord,
} from "./idb";

const urlCache = new Map<string, string>();

export async function getBlob(blobId: string): Promise<Blob | undefined> {
  const rec = await idbGet<BlobRecord>("blobs", blobId);
  return rec?.blob;
}

export async function getBlobUrl(blobId: string): Promise<string | undefined> {
  const cached = urlCache.get(blobId);
  if (cached) return cached;
  const blob = await getBlob(blobId);
  if (!blob) return undefined;
  const url = URL.createObjectURL(blob);
  urlCache.set(blobId, url);
  return url;
}

function forgetUrl(blobId: string) {
  const url = urlCache.get(blobId);
  if (url) {
    URL.revokeObjectURL(url);
    urlCache.delete(blobId);
  }
}

export async function listPhotos(): Promise<PhotoRecord[]> {
  const photos = await idbGetAll<PhotoRecord>("photos");
  return photos.sort((a, b) => b.uploadedAt - a.uploadedAt);
}

export async function getPhoto(id: string) {
  return idbGet<PhotoRecord>("photos", id);
}

export async function listResults(): Promise<ResultRecord[]> {
  const results = await idbGetAll<ResultRecord>("results");
  return results.sort((a, b) => b.generatedAt - a.generatedAt);
}

export async function listResultsForPhoto(photoId: string): Promise<ResultRecord[]> {
  const results = await idbGetAllByIndex<ResultRecord>("results", "by-photoId", photoId);
  return results.sort((a, b) => b.generatedAt - a.generatedAt);
}

export async function getResult(id: string) {
  return idbGet<ResultRecord>("results", id);
}

export async function addPhotoFromFile(file: File): Promise<PhotoRecord> {
  const prepared = await prepareOriginal(file);
  const originalBlobId = uid("blob");
  const thumbBlobId = uid("blob");
  const photo: PhotoRecord = {
    id: uid("photo"),
    filename: file.name || undefined,
    uploadedAt: Date.now(),
    width: prepared.width,
    height: prepared.height,
    mimeType: prepared.mimeType,
    originalBlobId,
    thumbBlobId,
  };
  await idbPut<BlobRecord>("blobs", { id: originalBlobId, blob: prepared.blob });
  await idbPut<BlobRecord>("blobs", { id: thumbBlobId, blob: prepared.thumb });
  await idbPut("photos", photo);
  emitDbChange();
  return photo;
}

export async function updatePhotoNotes(id: string, notes: string) {
  const photo = await getPhoto(id);
  if (!photo) return;
  await idbPut("photos", { ...photo, notes });
  emitDbChange();
}

export async function saveResult(input: {
  photoId: string;
  sourceKind: "original" | "result";
  sourceResultId?: string;
  toolId: string;
  toolName: string;
  prompt: string;
  fields?: Record<string, string>;
  extra?: string;
  image: Blob;
  notes?: string;
}): Promise<ResultRecord> {
  const { width, height } = await measureBlob(input.image);
  const thumb = await makeThumb(input.image);
  const blobId = uid("blob");
  const thumbBlobId = uid("blob");
  const result: ResultRecord = {
    id: uid("result"),
    photoId: input.photoId,
    sourceKind: input.sourceKind,
    sourceResultId: input.sourceResultId,
    toolId: input.toolId,
    toolName: input.toolName,
    prompt: input.prompt,
    fields: input.fields,
    extra: input.extra,
    generatedAt: Date.now(),
    notes: input.notes,
    blobId,
    thumbBlobId,
    width,
    height,
    saved: true,
  };
  await idbPut<BlobRecord>("blobs", { id: blobId, blob: input.image });
  await idbPut<BlobRecord>("blobs", { id: thumbBlobId, blob: thumb });
  await idbPut("results", result);
  emitDbChange();
  return result;
}

export async function deleteResult(id: string) {
  const result = await getResult(id);
  if (!result) return;
  forgetUrl(result.blobId);
  forgetUrl(result.thumbBlobId);
  await idbDelete("blobs", result.blobId);
  await idbDelete("blobs", result.thumbBlobId);
  await idbDelete("results", id);
  emitDbChange();
}

export async function deletePhoto(id: string) {
  const photo = await getPhoto(id);
  if (!photo) return;
  const results = await listResultsForPhoto(id);
  for (const result of results) {
    await deleteResult(result.id);
  }
  forgetUrl(photo.originalBlobId);
  forgetUrl(photo.thumbBlobId);
  await idbDelete("blobs", photo.originalBlobId);
  await idbDelete("blobs", photo.thumbBlobId);
  await idbDelete("photos", id);
  emitDbChange();
}

export async function clearSavedResults() {
  const results = await listResults();
  for (const result of results) {
    await deleteResult(result.id);
  }
}

export async function clearPhotoHistory() {
  const photos = await listPhotos();
  for (const photo of photos) {
    await deletePhoto(photo.id);
  }
  await idbClear("photos");
  await idbClear("results");
  await idbClear("blobs");
  for (const url of urlCache.values()) URL.revokeObjectURL(url);
  urlCache.clear();
  emitDbChange();
}

export async function storageSummary() {
  const photos = await listPhotos();
  const results = await listResults();
  let quota: { usage: number; quota: number } | null = null;
  if (navigator.storage?.estimate) {
    const est = await navigator.storage.estimate();
    quota = { usage: est.usage ?? 0, quota: est.quota ?? 0 };
  }
  return {
    photoCount: photos.length,
    resultCount: results.length,
    quota,
  };
}
