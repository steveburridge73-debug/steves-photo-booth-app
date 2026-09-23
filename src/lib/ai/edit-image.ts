import { createServerFn } from "@tanstack/react-start";

type ImageOut = {
  url?: string;
  b64_json?: string;
  mime_type?: string;
};

async function toDataUrlFromUrl(url: string): Promise<string> {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Could not download the edited photograph");
  const buffer = Buffer.from(await res.arrayBuffer());
  const mime = res.headers.get("content-type") || "image/jpeg";
  return `data:${mime};base64,${buffer.toString("base64")}`;
}

function fromB64(b64: string, mime = "image/jpeg") {
  return `data:${mime};base64,${b64}`;
}

export const checkAiAvailable = createServerFn({ method: "POST" }).handler(
  async (): Promise<{ available: boolean }> => {
    return { available: Boolean(process.env.XAI_API_KEY) };
  },
);

export const editPhotograph = createServerFn({ method: "POST" })
  .validator((input: { prompt: string; images: string[] }) => {
    if (!input?.prompt?.trim()) throw new Error("Prompt is required");
    if (!input.images?.length) throw new Error("A photograph is required");
    if (input.images.length > 3) throw new Error("Up to three photographs only");
    return {
      prompt: input.prompt.trim(),
      images: input.images,
    };
  })
  .handler(async ({ data }): Promise<{ ok: true; dataUrl: string } | { ok: false; error: string }> => {
    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) {
      return { ok: false, error: "The AI workshop is not available in this environment." };
    }

    const images = data.images.map((url) => ({ type: "image_url" as const, url }));
    const body: Record<string, unknown> = {
      model: "grok-imagine-image-2.0",
      prompt: data.prompt,
      n: 1,
    };
    if (images.length === 1) {
      body.image = images[0];
    } else {
      body.images = images;
    }

    const res = await fetch("https://api.x.ai/v1/images/edits", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      let detail = "";
      try {
        const errBody = (await res.json()) as { error?: { message?: string } };
        detail = errBody.error?.message ?? "";
      } catch {
        detail = await res.text().catch(() => "");
      }
      return {
        ok: false,
        error: detail ? `Workshop error: ${detail}` : `Workshop error ${res.status}`,
      };
    }

    const json = (await res.json()) as { data?: ImageOut[] };
    const first = json.data?.[0];
    if (!first) return { ok: false, error: "The workshop returned no image." };

    try {
      if (first.b64_json) {
        return { ok: true, dataUrl: fromB64(first.b64_json, first.mime_type) };
      }
      if (first.url) {
        return { ok: true, dataUrl: await toDataUrlFromUrl(first.url) };
      }
      return { ok: false, error: "The workshop returned an empty image." };
    } catch {
      return { ok: false, error: "Could not read the edited photograph." };
    }
  });
