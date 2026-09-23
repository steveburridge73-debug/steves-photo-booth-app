export type RecipeStep = {
  toolId: string;
  label: string;
};

export type Recipe = {
  id: string;
  name: string;
  description: string;
  steps: RecipeStep[];
};

export const RECIPES: Recipe[] = [
  {
    id: "old-album",
    name: "Old album print",
    description: "Restore, colourise, then a print-ready file.",
    steps: [
      { toolId: "restore-photograph", label: "Restore" },
      { toolId: "colourise-mono", label: "Colourise" },
      { toolId: "print-ready", label: "Print ready" },
    ],
  },
  {
    id: "scan-pack",
    name: "Scanned print pack",
    description: "Repair damage, sharpen, then a printable layout.",
    steps: [
      { toolId: "repair-damage", label: "Repair" },
      { toolId: "upscale-sharpen", label: "Sharpen" },
      { toolId: "printable-layout", label: "Print layout" },
    ],
  },
  {
    id: "selfie-linkedin",
    name: "Selfie to LinkedIn",
    description: "A professional headshot, then a square social frame.",
    steps: [
      { toolId: "linkedin-headshot", label: "LinkedIn headshot" },
      { toolId: "instagram-square", label: "Square frame" },
    ],
  },
  {
    id: "holiday-share",
    name: "Holiday to share",
    description: "Smart fix, then an Instagram portrait frame.",
    steps: [
      { toolId: "smart-auto-fix", label: "Smart Auto Fix" },
      { toolId: "instagram-portrait", label: "Instagram portrait" },
    ],
  },
];

export function getRecipe(id: string) {
  return RECIPES.find((r) => r.id === id);
}
