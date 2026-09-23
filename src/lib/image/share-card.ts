export async function makeShareCard(
  originalUrl: string,
  resultUrl: string,
): Promise<string> {
  const [original, result] = await Promise.all([
    loadImage(originalUrl),
    loadImage(resultUrl),
  ]);
  const gutter = 16;
  const labelH = 36;
  const maxPanel = 720;
  const left = fit(original, maxPanel);
  const right = fit(result, maxPanel);
  const panelH = Math.max(left.h, right.h);
  const canvas = document.createElement("canvas");
  canvas.width = left.w + right.w + gutter * 3;
  canvas.height = panelH + gutter * 2 + labelH;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not draw the comparison card.");
  ctx.fillStyle = "#14110f";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#c17a4a";
  ctx.font = "600 18px Outfit, system-ui, sans-serif";
  ctx.fillText("Original", gutter, gutter + 22);
  ctx.fillText("Result", left.w + gutter * 2, gutter + 22);
  drawContained(ctx, original, gutter, gutter + labelH, left.w, panelH);
  drawContained(ctx, result, left.w + gutter * 2, gutter + labelH, right.w, panelH);
  return canvas.toDataURL("image/jpeg", 0.92);
}

function loadImage(url: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Could not read a photograph for the card."));
    img.src = url;
  });
}

function fit(img: HTMLImageElement, max: number) {
  const scale = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
  return {
    w: Math.max(1, Math.round(img.naturalWidth * scale)),
    h: Math.max(1, Math.round(img.naturalHeight * scale)),
  };
}

function drawContained(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number,
) {
  const scale = Math.min(w / img.naturalWidth, h / img.naturalHeight);
  const dw = img.naturalWidth * scale;
  const dh = img.naturalHeight * scale;
  const dx = x + (w - dw) / 2;
  const dy = y + (h - dh) / 2;
  ctx.drawImage(img, dx, dy, dw, dh);
}
