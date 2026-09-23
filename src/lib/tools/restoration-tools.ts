import { DEFAULT_OUTPUT } from "./identity";
import type { RestoreGroupDefinition, ToolDefinition } from "./types";

export const RESTORE_GROUPS: RestoreGroupDefinition[] = [
  {
    id: "repair",
    name: "Restore & Repair",
    description: "Faithful repair of damage, scratches, stains and soft faces.",
  },
  {
    id: "colour",
    name: "Colour & Detail",
    description: "Colourise, clarify and recover resolution without reinventing the picture.",
  },
  {
    id: "complete",
    name: "Complete Restoration",
    description: "A full remaster, or two versions to compare.",
  },
];

export const RESTORATION_TOOLS: ToolDefinition[] = [
  {
    id: "restore-photograph",
    category: "restoration",
    restoreGroup: "repair",
    name: "Restore Old Photograph",
    shortDescription: "Recover a faded or worn print without redesigning it.",
    icon: "history",
    identityPreservation: "strict",
    version: 1,
    active: true,
    example: "A scratched 1960s print made whole, still looking of its time.",
    mainPrompt:
      "Restore this old photograph. Repair scratches, dust, tears, stains, fading, silvering and surface damage. Recover lost contrast and detail. Keep the original era, clothing, pose, grain and scene. Do not modernise the setting, restyle the people, or apply a beauty filter. Do not reimagine faces.",
    outputFormat: DEFAULT_OUTPUT,
  },
  {
    id: "repair-damage",
    category: "restoration",
    restoreGroup: "repair",
    name: "Repair Damage",
    shortDescription: "Fix tears, creases, stains and missing flakes.",
    icon: "bandage",
    identityPreservation: "strict",
    version: 1,
    active: true,
    mainPrompt:
      "Repair physical damage only: tears, creases, missing flakes, stains, scratches and dust. Reconstruct damaged areas so they match neighbouring tones and textures. Do not change colour, composition or faces beyond the repair itself.",
    outputFormat: DEFAULT_OUTPUT,
  },
  {
    id: "remove-scratches-stains",
    category: "restoration",
    restoreGroup: "repair",
    name: "Remove Scratches & Stains",
    shortDescription: "Clean surface damage. Leave the photograph itself.",
    icon: "eraser",
    identityPreservation: "strict",
    version: 1,
    active: true,
    mainPrompt:
      "Clean and restore this photograph by removing scratches, dust, stains, creases, spots and surface damage. Reconstruct affected areas naturally using the surrounding visual information. Preserve the original faces, textures, lighting, composition and photographic character.",
    outputFormat: DEFAULT_OUTPUT,
  },
  {
    id: "restore-blurry-face",
    category: "restoration",
    restoreGroup: "repair",
    portraitGroup: "finishing",
    name: "Restore a Blurry Face",
    shortDescription: "Recover facial clarity without inventing a new face.",
    icon: "scanFace",
    identityPreservation: "strict",
    version: 1,
    active: true,
    mainPrompt:
      "Carefully restore the faces in this old photo. Improve facial clarity, eyes, hair, skin texture and fine details while preserving each person’s recognisable identity, age, expression and natural features. Do not beautify, reshape or invent facial details that are not supported by the original image. Restore this soft or slightly blurry shot with improved clarity, edge definition, and fine texture. Recover photographic sharpness naturally without fabricating, reshaping, or modifying any facial feature.",
    outputFormat: DEFAULT_OUTPUT,
  },
  {
    id: "colourise-mono",
    category: "restoration",
    restoreGroup: "colour",
    name: "Colourise",
    shortDescription: "Add believable colour to a black-and-white photo.",
    icon: "droplets",
    identityPreservation: "strict",
    version: 1,
    active: true,
    mainPrompt:
      "Colourise this black-and-white or faded photograph with realistic, historically plausible colours. Skin, hair, clothing and environment should feel observed, not painted. Keep identity, pose, lighting and grain. Avoid oversaturated modern colours. Do not change the scene. Colourize this black-and-white photo with realistic, historically appropriate colors. Preserve every person and object exactly as shown, using natural skin tones, clothing colors, materials, lighting, and environmental colors. Avoid oversaturation or artificial-looking color.",
    outputFormat: DEFAULT_OUTPUT,
  },
  {
    id: "taken-today",
    category: "restoration",
    restoreGroup: "colour",
    name: "Make It Look Like Today",
    shortDescription: "Modern camera quality. Same people, clothes and scene.",
    icon: "camera",
    identityPreservation: "strict",
    version: 1,
    active: true,
    mainPrompt:
      "Restore and enhance this old photo so it looks like it was captured with a modern high-quality camera today. Improve sharpness, exposure, contrast, dynamic range, skin detail and overall clarity while preserving the exact people, expressions, clothing, setting and composition. Keep the result natural and photorealistic. Restore this photo as if it were captured with a modern professional camera. Improve exposure, sharpness, dynamic range, contrast and natural detail while preserving the original people, clothing, setting, pose and composition. Do not modernize the scene or change the original identities.",
    outputFormat: DEFAULT_OUTPUT,
  },
  {
    id: "upscale-sharpen",
    category: "restoration",
    restoreGroup: "colour",
    name: "Upscale & Sharpen",
    shortDescription: "Higher resolution and natural detail. No plastic skin.",
    icon: "maximize",
    identityPreservation: "strict",
    version: 1,
    active: true,
    mainPrompt:
      "Enhance this old photo to high resolution while keeping it realistic. Recover fine details, improve focus, reduce grain and unwanted blur, and increase overall clarity. Preserve natural skin texture and avoid artificial sharpening, plastic-looking faces or invented details.",
    outputFormat: DEFAULT_OUTPUT,
  },
  {
    id: "enhance-quality",
    category: "restoration",
    restoreGroup: "colour",
    editGroup: "quality",
    name: "Improve Quality",
    shortDescription: "Sharpen, clean and lift a low-quality image.",
    icon: "scanSearch",
    identityPreservation: "strict",
    version: 1,
    active: true,
    mainPrompt:
      "Improve clarity, sharpness and overall image quality. Reduce noise, grain that is damage (not film character), and compression artefacts. Do not change the content, faces, colours or composition. No face-smoothing or beauty filter. Do not invent detail that would change identity.",
    outputFormat: DEFAULT_OUTPUT,
  },
  {
    id: "full-remaster",
    category: "restoration",
    restoreGroup: "complete",
    name: "Full Photo Remaster",
    shortDescription: "A complete, natural restoration of the whole print.",
    icon: "contrast",
    identityPreservation: "strict",
    version: 1,
    active: true,
    mainPrompt:
      "Perform a complete professional restoration of this old photograph. Repair physical damage, remove dust and scratches, correct fading and discolouration, reduce blur and noise, restore lost detail, balance exposure and improve overall clarity. Preserve every person’s identity, expression, age, clothing and the original composition. The final result should look naturally restored rather than artificially generated.",
    outputFormat: DEFAULT_OUTPUT,
  },
  {
    id: "two-restorations",
    category: "restoration",
    restoreGroup: "complete",
    name: "Create Two Restorations",
    shortDescription:
      "Compare a faithful archival restoration with a refined modern restoration.",
    icon: "arrows",
    identityPreservation: "strict",
    version: 1,
    active: true,
    note: "This makes two separate restorations. Each is saved on its own. The original is never overwritten.",
    mainPrompt:
      "Create a restoration of this photograph. Preserve the original people, faces, expressions, clothing, objects, lighting, composition and historical character. Do not invent unnecessary details, change identities or redesign the photograph.",
    variants: [
      {
        id: "archival",
        label: "Version 1 — Faithful Archival Restoration",
        prompt:
          "This must be a faithful archival restoration that stays extremely close to the original. Repair damage, fading, scratches, stains and deterioration while preserving the original people, faces, expressions, clothing, objects, lighting, composition and historical character. Keep period photographic character. Do not modernise.",
      },
      {
        id: "modern",
        label: "Version 2 — Refined Modern Restoration",
        prompt:
          "This must be a refined modern restoration with enhanced clarity, exposure, colour, detail and overall photographic quality. Preserve the original people, facial identity, expressions, clothing, objects and composition. Do not invent a different scene.",
      },
    ],
    outputFormat: DEFAULT_OUTPUT,
  },
];
