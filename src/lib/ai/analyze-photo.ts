import { createServerFn } from "@tanstack/react-start";

export type PhotoIssue = {
  id: string;
  label: string;
  detail: string;
  recommended: boolean;
};

const ISSUE_CATALOG = [
  "Low exposure",
  "Overexposed highlights",
  "Weak contrast",
  "Softness or slight blur",
  "Digital noise",
  "Colour cast",
  "Haze",
  "Distracting background objects",
  "Tilted horizon",
  "Perspective distortion",
  "Heavy shadows",
  "Skin underexposure",
  "Awkward composition",
] as const;

export const analyzePhotograph = createServerFn({ method: "POST" })
  .validator((input: { image: string }) => {
    if (!input?.image) throw new Error("A photograph is required");
    return { image: input.image };
  })
  .handler(
    async ({
      data,
    }): Promise<
      { ok: true; summary: string; issues: PhotoIssue[] } | { ok: false; error: string }
    > => {
      const apiKey = process.env.XAI_API_KEY;
      if (!apiKey) {
        return { ok: false, error: "The AI workshop is not available in this environment." };
      }

      const catalog = ISSUE_CATALOG.join(", ");
      const res = await fetch("https://api.x.ai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "grok-4.5",
          max_tokens: 700,
          temperature: 0.2,
          response_format: { type: "json_object" },
          messages: [
            {
              role: "system",
              content:
                "You analyse photographs for technical problems only. Never suggest restyling, beautifying, changing clothes, or replacing people. Return JSON only.",
            },
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: `Analyse this photograph for technical issues. Choose only from: ${catalog}. Return JSON: {"summary":"one short sentence","issues":[{"id":"slug","label":"from the list","detail":"one short sentence","recommended":true}]}. Include issues you actually see. Mark recommended true only for clear, conservative fixes. Do not invent problems. If the photo is already fine, return an empty issues array and say so in summary.`,
                },
                { type: "image_url", image_url: { url: data.image } },
              ],
            },
          ],
        }),
      });

      if (!res.ok) {
        return { ok: false, error: `Analysis error ${res.status}` };
      }

      const body = (await res.json()) as {
        choices?: { message?: { content?: string } }[];
      };
      const raw = body.choices?.[0]?.message?.content ?? "";
      try {
        const parsed = JSON.parse(raw) as {
          summary?: string;
          issues?: PhotoIssue[];
        };
        const issues = Array.isArray(parsed.issues)
          ? parsed.issues
              .filter((item) => item?.label)
              .map((item, i) => ({
                id: String(item.id || `issue-${i}`),
                label: String(item.label),
                detail: String(item.detail || item.label),
                recommended: Boolean(item.recommended),
              }))
          : [];
        return {
          ok: true,
          summary: parsed.summary?.trim() || "Analysis complete.",
          issues,
        };
      } catch {
        return {
          ok: false,
          error: "Could not read the analysis. Try again.",
        };
      }
    },
  );
