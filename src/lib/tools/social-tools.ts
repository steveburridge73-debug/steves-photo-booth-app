import { DEFAULT_OUTPUT } from "./identity";
import type { SocialGroupDefinition, ToolDefinition } from "./types";

export const SOCIAL_GROUPS: SocialGroupDefinition[] = [
  {
    id: "social",
    name: "Social frames",
    description: "Expand or reframe for apps. Faces stay in frame.",
  },
  {
    id: "print",
    name: "Wallpaper & print",
    description: "Phone, desktop and a clean print-ready file.",
  },
  {
    id: "custom",
    name: "Custom size",
    description: "Your ratio, or the existing Expand / Aspect tools.",
  },
];

const PROTECT =
  "Protect faces and important subjects. Prefer expanding the scene over cropping them away. Keep identity, clothing and the original photograph’s content. The original file stays unchanged.";

export const SOCIAL_TOOLS: ToolDefinition[] = [
  {
    id: "instagram-portrait",
    category: "social",
    socialGroup: "social",
    name: "Instagram Portrait",
    shortDescription: "Vertical 4:5. Expand rather than cut faces.",
    icon: "frame",
    identityPreservation: "strict",
    version: 1,
    active: true,
    mainPrompt:
      `Prepare this photograph for Instagram portrait (4:5). ${PROTECT} Expand the frame to 4:5 by naturally continuing the background, lighting and textures. Do not redesign the subject.`,
    outputFormat: DEFAULT_OUTPUT,
  },
  {
    id: "instagram-square",
    category: "social",
    socialGroup: "social",
    name: "Instagram Square",
    shortDescription: "1:1 square. Keep the subject whole.",
    icon: "ratio",
    identityPreservation: "strict",
    version: 1,
    active: true,
    mainPrompt:
      `Prepare this photograph as a 1:1 square image. ${PROTECT} Expand the scene to square if needed rather than chopping the subject.`,
    outputFormat: DEFAULT_OUTPUT,
  },
  {
    id: "facebook-frame",
    category: "social",
    socialGroup: "social",
    name: "Facebook",
    shortDescription: "A comfortable landscape post frame.",
    icon: "globe",
    identityPreservation: "strict",
    version: 1,
    active: true,
    mainPrompt:
      `Prepare this photograph for a Facebook post, around 1.91:1 landscape. ${PROTECT} Expand the sides naturally if needed.`,
    outputFormat: DEFAULT_OUTPUT,
  },
  {
    id: "whatsapp-profile",
    category: "social",
    socialGroup: "social",
    name: "WhatsApp Profile",
    shortDescription: "A square crop that keeps the face.",
    icon: "user",
    identityPreservation: "strict",
    version: 1,
    active: true,
    mainPrompt:
      `Prepare this photograph as a WhatsApp-style profile image: 1:1, face clearly in frame and not cut off. ${PROTECT} Prefer a careful reframe around the person over a tight crop that loses identity.`,
    outputFormat: DEFAULT_OUTPUT,
  },
  {
    id: "phone-wallpaper",
    category: "social",
    socialGroup: "print",
    name: "Phone Wallpaper",
    shortDescription: "Tall 9:16. Subject stays safe from the edges.",
    icon: "maximize",
    identityPreservation: "strict",
    version: 1,
    active: true,
    mainPrompt:
      `Prepare this photograph as a phone wallpaper in 9:16. ${PROTECT} Keep the important subject away from the very top and bottom edges so UI chrome will not cover it. Expand the scene rather than cutting the subject.`,
    outputFormat: DEFAULT_OUTPUT,
  },
  {
    id: "desktop-wallpaper",
    category: "social",
    socialGroup: "print",
    name: "Desktop Wallpaper",
    shortDescription: "Widescreen 16:9 for a computer.",
    icon: "tv",
    identityPreservation: "strict",
    version: 1,
    active: true,
    mainPrompt:
      `Prepare this photograph as a desktop wallpaper in 16:9. ${PROTECT} Expand left and right naturally if the original is taller.`,
    outputFormat: DEFAULT_OUTPUT,
  },
  {
    id: "print-ready",
    category: "social",
    socialGroup: "print",
    name: "Print Ready",
    shortDescription: "Highest practical quality for a print.",
    icon: "printer",
    identityPreservation: "strict",
    version: 1,
    active: true,
    fields: [
      {
        id: "size",
        label: "Print size",
        type: "select",
        defaultValue: "6x4 inch print",
        options: [
          { value: "6x4 inch print", label: "6×4 inch" },
          { value: "5x7 inch print", label: "5×7 inch" },
          { value: "8x10 inch print", label: "8×10 inch" },
          { value: "A4", label: "A4" },
          { value: "A3", label: "A3" },
        ],
      },
    ],
    mainPrompt:
      `Prepare this photograph as a print-ready file for {{size}}. Increase practical resolution and evenness without inventing detail. ${PROTECT} Do not add borders, logos or frames.`,
    outputFormat: DEFAULT_OUTPUT,
  },
  {
    id: "custom-size",
    category: "social",
    socialGroup: "custom",
    name: "Custom Size",
    shortDescription: "Width, height or ratio you choose.",
    icon: "expand",
    identityPreservation: "strict",
    version: 1,
    active: true,
    fields: [
      {
        id: "aspect",
        label: "Aspect ratio",
        type: "select",
        defaultValue: "4:5 portrait",
        options: [
          { value: "1:1 square", label: "1:1" },
          { value: "4:5 portrait", label: "4:5" },
          { value: "3:4 portrait", label: "3:4" },
          { value: "4:3 landscape", label: "4:3" },
          { value: "16:9 landscape", label: "16:9" },
          { value: "9:16 portrait", label: "9:16" },
          { value: "custom dimensions below", label: "Custom dimensions" },
        ],
      },
      {
        id: "width",
        label: "Width",
        type: "text",
        placeholder: "e.g. 1080",
        fallback: "the width implied by the aspect ratio",
      },
      {
        id: "height",
        label: "Height",
        type: "text",
        placeholder: "e.g. 1350",
        fallback: "the height implied by the aspect ratio",
      },
      {
        id: "orientation",
        label: "Orientation",
        type: "select",
        defaultValue: "as suits the photograph",
        options: [
          { value: "as suits the photograph", label: "Keep similar" },
          { value: "portrait", label: "Portrait" },
          { value: "landscape", label: "Landscape" },
          { value: "square", label: "Square" },
        ],
      },
    ],
    mainPrompt:
      `Reformat this photograph to {{aspect}}, orientation {{orientation}}, about {{width}} by {{height}}. ${PROTECT} Expand the existing scene to fill the new frame rather than cutting important parts away.`,
    outputFormat: DEFAULT_OUTPUT,
  },
];
