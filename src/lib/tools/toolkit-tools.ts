import { DEFAULT_OUTPUT } from "./identity";
import type { ToolkitGroupDefinition, ToolDefinition } from "./types";

export const TOOLKIT_GROUPS: ToolkitGroupDefinition[] = [
  {
    id: "erase",
    name: "Remove & Replace",
    description: "Take something out, or swap it. The rest of the photo stays.",
  },
  {
    id: "fill",
    name: "Fill & Add",
    description: "Describe what should appear. Match light and scale.",
  },
  {
    id: "sky",
    name: "Sky & Light",
    description: "New sky or new light. Same place, same people.",
  },
  {
    id: "scene",
    name: "Background & Variation",
    description: "A new setting, or a careful variation of this shot.",
  },
];

export const TOOLKIT_TOOLS: ToolDefinition[] = [
  {
    id: "generative-fill",
    category: "toolkit",
    toolkitGroup: "fill",
    name: "Generative Fill",
    shortDescription: "Describe what should appear in an area.",
    icon: "wand",
    identityPreservation: "strict",
    version: 1,
    active: true,
    fields: [
      {
        id: "area",
        label: "Area",
        type: "text",
        required: true,
        placeholder: "e.g. the empty wall on the right, the sky gap between trees",
      },
      {
        id: "content",
        label: "What should appear",
        type: "textarea",
        required: true,
        placeholder: "e.g. a climbing rose, a window box of herbs",
      },
    ],
    mainPrompt:
      "In this area of the photograph — {{area}} — generate {{content}}. Match perspective, lighting, shadows, texture, colour, scale and image quality. Do not change anything outside that area. Do not alter people unless they are inside the named area and the instruction requires it.",
    outputFormat: DEFAULT_OUTPUT,
  },
  {
    id: "add-element",
    category: "toolkit",
    toolkitGroup: "fill",
    name: "Add an Element",
    shortDescription: "Place something new so it looks photographed.",
    icon: "layers",
    identityPreservation: "strict",
    version: 1,
    active: true,
    fields: [
      {
        id: "element",
        label: "What to add",
        type: "textarea",
        required: true,
        placeholder: "e.g. a ginger cat on the wall, a vintage bicycle by the door",
      },
      {
        id: "where",
        label: "Where",
        type: "text",
        placeholder: "e.g. on the left of the path",
        fallback: "a natural place in the scene",
      },
    ],
    mainPrompt:
      "Add this element to the photograph: {{element}}, placed {{where}}. Match scale, perspective, lighting, shadows, depth and image quality. Do not change existing people, identity, clothing or anything else.",
    outputFormat: DEFAULT_OUTPUT,
  },
  {
    id: "change-sky",
    category: "toolkit",
    toolkitGroup: "sky",
    name: "Change the Sky",
    shortDescription: "Replace the sky and relight only as needed.",
    icon: "cloud",
    identityPreservation: "strict",
    version: 1,
    active: true,
    fields: [
      {
        id: "sky",
        label: "Sky",
        type: "select",
        defaultValue: "a clear natural blue sky with soft clouds",
        options: [
          { value: "a clear natural blue sky with soft clouds", label: "Blue sky" },
          { value: "an overcast cloudy sky", label: "Cloudy" },
          { value: "a dramatic stormy sky", label: "Dramatic" },
          { value: "a warm sunset sky", label: "Sunset" },
          { value: "a soft sunrise sky", label: "Sunrise" },
          { value: "a clear night sky", label: "Night" },
        ],
      },
    ],
    mainPrompt:
      "Replace the sky with {{sky}}. Naturally relight the scene only as far as needed so the new sky matches. Keep people, buildings, landscape and composition. Do not invent a different location.",
    outputFormat: DEFAULT_OUTPUT,
  },
  {
    id: "realistic-variation",
    category: "toolkit",
    toolkitGroup: "scene",
    name: "Create Realistic Variation",
    shortDescription: "Another take of the same shot. Identity stays.",
    icon: "images",
    identityPreservation: "strict",
    version: 1,
    active: true,
    fields: [
      {
        id: "tweak",
        label: "What may vary",
        type: "text",
        placeholder: "e.g. a slightly different pose, a small crop",
        fallback: "a subtle photographic variation of timing and expression",
      },
    ],
    mainPrompt:
      "Create a realistic photographic variation of this image. Preserve the identity and important characteristics of the original subject. Allowed variation: {{tweak}}. Do not redesign the scene or invent a different person.",
    outputFormat: DEFAULT_OUTPUT,
  },
];
