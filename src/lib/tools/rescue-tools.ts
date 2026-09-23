import { DEFAULT_OUTPUT } from "./identity";
import type { RescueGroupDefinition, ToolDefinition, ToolField } from "./types";

export const RESCUE_GROUPS: RescueGroupDefinition[] = [
  {
    id: "clarity",
    name: "Clarity Rescue",
    description: "Blur, pixels and small files. Recover only what is really there.",
  },
  {
    id: "exposure",
    name: "Exposure & Noise",
    description: "Dark, bright or noisy photographs from old cameras and phones.",
  },
  {
    id: "damaged",
    name: "Damaged Photo Rescue",
    description: "Tick the repairs you want. Preview, then save as a new version.",
  },
];

function toggles(options: string[], recommended: string[] = []): ToolField {
  return {
    id: "selected",
    label: "Recommended repairs",
    type: "toggles",
    help: "Suggested repairs are on. Untick anything you do not want. Original stays safe.",
    defaultValue: recommended.join("\n"),
    fallback: "none — apply only a careful overall rescue. Do not invent missing detail.",
    options: options.map((label) => ({ value: label, label })),
  };
}

export const RESCUE_TOOLS: ToolDefinition[] = [
  {
    id: "severely-blurry",
    category: "rescue",
    rescueGroup: "clarity",
    name: "Severely Blurry Photo",
    shortDescription: "Recover realistic detail. Do not invent faces.",
    icon: "focus",
    identityPreservation: "strict",
    version: 1,
    active: true,
    note: "Only recover what is reasonably in the photograph. No invented people or features.",
    mainPrompt:
      "Attempt to recover maximum realistic detail from this severely blurry photograph. Improve facial clarity where genuinely recoverable, edges, clothing detail, objects, background detail and overall sharpness. Do not invent facial features, people, objects or details that cannot reasonably be recovered. Keep identity, pose and composition.",
    outputFormat: DEFAULT_OUTPUT,
  },
  {
    id: "low-resolution-rescue",
    category: "rescue",
    rescueGroup: "clarity",
    name: "Low-Resolution Photo",
    shortDescription: "A small file, made as clear as it honestly can be.",
    icon: "expand",
    identityPreservation: "strict",
    version: 1,
    active: true,
    note: "Missing information is not invented. Faces and proportions stay as they are.",
    mainPrompt:
      "Improve this small, low-resolution photograph and produce the highest-quality realistic result possible. Preserve faces, identity, proportions, clothing, objects and original composition. Do not turn missing information into invented detail.",
    outputFormat: DEFAULT_OUTPUT,
  },
  {
    id: "pixelated-compressed",
    category: "rescue",
    rescueGroup: "clarity",
    name: "Pixelated / Compressed Photo",
    shortDescription: "Ease blocks, JPEG and colour artefacts.",
    icon: "scanSearch",
    identityPreservation: "strict",
    version: 1,
    active: true,
    mainPrompt:
      "Reduce visible pixelation, JPEG compression, block artefacts, digital noise and colour artefacts in this photograph. Restore natural-looking detail while preserving the original photograph, faces and composition. Do not invent new content.",
    outputFormat: DEFAULT_OUTPUT,
  },
  {
    id: "motion-blur-rescue",
    category: "rescue",
    rescueGroup: "clarity",
    name: "Motion Blur",
    shortDescription: "Steady a smeared shot where the detail is still there.",
    icon: "rotate",
    identityPreservation: "strict",
    version: 1,
    active: true,
    mainPrompt:
      "Reduce motion blur in this photograph where possible. Recover edges, facial detail, text where genuinely recoverable, objects and environmental detail. Do not manufacture detail that was never captured. Keep identity and composition.",
    outputFormat: DEFAULT_OUTPUT,
  },
  {
    id: "underexposed-rescue",
    category: "rescue",
    rescueGroup: "exposure",
    name: "Underexposed Photo",
    shortDescription: "Lift crushed shadows. Keep contrast honest.",
    icon: "moon",
    identityPreservation: "strict",
    version: 1,
    active: true,
    mainPrompt:
      "Recover detail from excessively dark areas of this photograph while preserving realistic shadows and contrast. Do not flatten the picture or invent objects in pure black. Keep faces, colours and composition.",
    outputFormat: DEFAULT_OUTPUT,
  },
  {
    id: "overexposed-rescue",
    category: "rescue",
    rescueGroup: "exposure",
    name: "Overexposed Photo",
    shortDescription: "Pull back highlights. No fake detail in pure white.",
    icon: "sun",
    identityPreservation: "strict",
    version: 1,
    active: true,
    mainPrompt:
      "Recover highlights and reduce blown-out areas in this photograph where information remains available. Do not invent detail in completely clipped areas. Keep faces, colours and composition realistic.",
    outputFormat: DEFAULT_OUTPUT,
  },
  {
    id: "heavy-noise-rescue",
    category: "rescue",
    rescueGroup: "exposure",
    name: "Heavy Noise & Grain",
    shortDescription: "Calm ISO noise. Keep real texture.",
    icon: "aperture",
    identityPreservation: "strict",
    version: 1,
    active: true,
    mainPrompt:
      "Reduce excessive digital noise, high-ISO noise, colour noise and distracting grain in this photograph. Preserve legitimate photographic texture and fine detail. Do not plasticise skin or invent features.",
    outputFormat: DEFAULT_OUTPUT,
  },
  {
    id: "old-digital-rescue",
    category: "rescue",
    rescueGroup: "exposure",
    name: "Old Digital Photo Rescue",
    shortDescription: "Early cameras and phones, cleaned but not modernised.",
    icon: "camera",
    identityPreservation: "strict",
    version: 1,
    active: true,
    note: "Keeps the era of the picture. No artificial modern look.",
    mainPrompt:
      "Improve this photograph from an early digital camera, old phone or heavily compressed file. Clean noise, compression and softness. Do not make it look artificially modern. Preserve people, clothing, setting and composition.",
    outputFormat: DEFAULT_OUTPUT,
  },
  {
    id: "damaged-photo-rescue",
    category: "rescue",
    rescueGroup: "damaged",
    name: "Damaged Photo Rescue",
    shortDescription: "Tick repairs, preview, save as a new version.",
    icon: "bandage",
    identityPreservation: "strict",
    version: 1,
    active: true,
    note: "Recommended repairs start on. Review them, then apply. Original is never overwritten.",
    fields: [
      toggles(
        [
          "Repair tears, scratches and cracks",
          "Repair stains, spots and surface dirt",
          "Recover fading and discolouration",
          "Reconstruct missing corners or edges",
          "Clean dust and emulsion damage",
          "Reduce blur where recoverable",
          "Recover exposure and contrast",
          "Repair damaged faces only where supported by the original",
        ],
        [
          "Repair tears, scratches and cracks",
          "Repair stains, spots and surface dirt",
          "Recover fading and discolouration",
          "Clean dust and emulsion damage",
        ],
      ),
    ],
    mainPrompt:
      "Analyse this severely damaged photograph and apply a careful rescue. Reconstruct only what is reasonably supported by surrounding information. Do not invent people, faces or objects.\n\nApply only the selected repairs:\n{{selected}}\n\nPreserve identity, clothing, composition and historical character. Save as a restored version, not a new photograph.",
    outputFormat: DEFAULT_OUTPUT,
  },
];
