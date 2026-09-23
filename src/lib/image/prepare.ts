export type PreparedImage = {
  blob: Blob;
  thumb: Blob;
  width: number;
  height: number;
  mimeType: string;
};

const ORIGINAL_MAX_EDGE = 2560;
const EDIT_MAX_EDGE = 1536;
const THUMB_MAX_EDGE = 360;

function drawToCanvas(
  source: CanvasImageSource,
  width: number,
  height: number,
  maxEdge: number,
): HTMLCanvasElement {
  const scale = Math.min(1, maxEdge / Math.max(width, height));
  const w = Math.max(1, Math.round(width * scale));
  const h = Math.max(1, Math.round(height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not draw the photograph");
  ctx.drawImage(source, 0, 0, w, h);
  return canvas;
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) reject(new Error("Could not encode the photograph"));
        else resolve(blob);
      },
      type,
      quality,
    );
  });
}

async function bitmapFromBlob(blob: Blob) {
  if (typeof createImageBitmap === "function") {
    return createImageBitmap(blob);
  }
  const url = URL.createObjectURL(blob);
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("Could not read the photograph"));
      img.src = url;
    });
    return image;
  } finally {
    URL.revokeObjectURL(url);
  }
}

export async function prepareOriginal(file: Blob): Promise<PreparedImage> {
  const bitmap = await bitmapFromBlob(file);
  const width = "naturalWidth" in bitmap ? bitmap.naturalWidth : bitmap.width;
  const height = "naturalHeight" in bitmap ? bitmap.naturalHeight : bitmap.height;
  const originalCanvas = drawToCanvas(bitmap, width, height, ORIGINAL_MAX_EDGE);
  const thumbCanvas = drawToCanvas(bitmap, width, height, THUMB_MAX_EDGE);
  if ("close" in bitmap && typeof bitmap.close === "function") bitmap.close();

  const mimeType = "image/jpeg";
  const [blob, thumb] = await Promise.all([
    canvasToBlob(originalCanvas, mimeType, 0.92),
    canvasToBlob(thumbCanvas, mimeType, 0.8),
  ]);

  return {
    blob,
    thumb,
    width: originalCanvas.width,
    height: originalCanvas.height,
    mimeType,
  };
}

export async function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error ?? new Error("Read failed"));
    reader.readAsDataURL(blob);
  });
}

export async function prepareForEdit(blob: Blob): Promise<string> {
  const bitmap = await bitmapFromBlob(blob);
  const width = "naturalWidth" in bitmap ? bitmap.naturalWidth : bitmap.width;
  const height = "naturalHeight" in bitmap ? bitmap.naturalHeight : bitmap.height;
  const canvas = drawToCanvas(bitmap, width, height, EDIT_MAX_EDGE);
  if ("close" in bitmap && typeof bitmap.close === "function") bitmap.close();
  const prepared = await canvasToBlob(canvas, "image/jpeg", 0.88);
  return blobToDataUrl(prepared);
}

export async function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  const res = await fetch(dataUrl);
  return res.blob();
}

export async function measureBlob(blob: Blob): Promise<{ width: number; height: number }> {
  const bitmap = await bitmapFromBlob(blob);
  const width = "naturalWidth" in bitmap ? bitmap.naturalWidth : bitmap.width;
  const height = "naturalHeight" in bitmap ? bitmap.naturalHeight : bitmap.height;
  if ("close" in bitmap && typeof bitmap.close === "function") bitmap.close();
  return { width, height };
}

export async function makeThumb(blob: Blob): Promise<Blob> {
  const bitmap = await bitmapFromBlob(blob);
  const width = "naturalWidth" in bitmap ? bitmap.naturalWidth : bitmap.width;
  const height = "naturalHeight" in bitmap ? bitmap.naturalHeight : bitmap.height;
  const canvas = drawToCanvas(bitmap, width, height, THUMB_MAX_EDGE);
  if ("close" in bitmap && typeof bitmap.close === "function") bitmap.close();
  return canvasToBlob(canvas, "image/jpeg", 0.8);
}
