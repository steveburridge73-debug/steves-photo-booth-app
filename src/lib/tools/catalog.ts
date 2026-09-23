import { AUTOFIX_TOOLS } from "./autofix-tools";
import { CLOTHING_TOOLS } from "./clothing-tools";
import { EDITING_TOOLS } from "./editing-tools";
import { FUN_TOOLS } from "./fun-tools";
import { PORTRAIT_TOOLS } from "./portrait-tools";
import { PRINT_TOOLS } from "./print-tools";
import { RESCUE_TOOLS } from "./rescue-tools";
import { RESTORATION_TOOLS } from "./restoration-tools";
import { SMART_TOOLS } from "./smart-tools";
import { SOCIAL_TOOLS } from "./social-tools";
import { STYLE_TOOLS } from "./style-tools";
import { TOOLKIT_TOOLS } from "./toolkit-tools";
import type {
  AutofixGroupId,
  CategoryDefinition,
  ClothingGroupId,
  EditGroupId,
  FunGroupId,
  PortraitGroupId,
  PrintGroupId,
  RescueGroupId,
  RestoreGroupId,
  SocialGroupId,
  StyleGroupId,
  ToolkitGroupId,
  ToolDefinition,
} from "./types";

export const CATEGORIES: CategoryDefinition[] = [
  {
    id: "smart",
    name: "Smart Auto Fix",
    shortName: "Smart Fix",
    description: "Analyse first. Apply only the fixes you approve.",
    icon: "scanSearch",
  },
  {
    id: "restoration",
    name: "Photo Restoration",
    shortName: "Restore",
    description: "Restore the photograph faithfully. Do not invent a new one.",
    icon: "history",
  },
  {
    id: "rescue",
    name: "Photo Rescue & Recovery",
    shortName: "Rescue",
    description: "Difficult blur, pixels, exposure and damage. Originals stay safe.",
    icon: "bandage",
  },
  {
    id: "editing",
    name: "Photo Editing",
    shortName: "Editing",
    description: "Practical, controlled edits. Only the requested change.",
    icon: "sliders",
  },
  {
    id: "clothing",
    name: "Clothing, Outfit & Costume Studio",
    shortName: "Clothes",
    description: "Change clothes only. Face, pose and body stay.",
    icon: "shirt",
  },
  {
    id: "toolkit",
    name: "AI Photo Toolkit",
    shortName: "Toolkit",
    description: "Remove, fill, sky, light and careful variations.",
    icon: "wand",
  },
  {
    id: "autofix",
    name: "Automatic Picture Fixes",
    shortName: "Autofix",
    description: "Pick the kind of photograph. Tick only the extras you want.",
    icon: "sparkles",
  },
  {
    id: "portrait",
    name: "Professional Portrait Shots",
    shortName: "Portraits",
    description: "Polished portraits from a selfie. The face stays yours.",
    icon: "user",
  },
  {
    id: "styles",
    name: "Creative Styles",
    shortName: "Styles",
    description: "Creative editing looks — paint, film, illustration and photographic style.",
    icon: "aperture",
  },
  {
    id: "print",
    name: "Collages, Cards & Print",
    shortName: "Print",
    description: "Collages, cards and printable visual memories.",
    icon: "layoutGrid",
  },
  {
    id: "social",
    name: "Social & Print Studio",
    shortName: "Social",
    description: "Frames for apps, wallpapers and print. Expand rather than cut.",
    icon: "ratio",
  },
  {
    id: "fun",
    name: "Fun",
    shortName: "Fun",
    description: "Deliberate creative transformations. Not for repair or restoration.",
    icon: "smile",
  },
];

export const TOOLS: ToolDefinition[] = [
  ...FUN_TOOLS,
  ...EDITING_TOOLS,
  ...CLOTHING_TOOLS,
  ...TOOLKIT_TOOLS,
  ...SMART_TOOLS,
  ...AUTOFIX_TOOLS,
  ...RESTORATION_TOOLS,
  ...RESCUE_TOOLS,
  ...PORTRAIT_TOOLS,
  ...STYLE_TOOLS,
  ...PRINT_TOOLS,
  ...SOCIAL_TOOLS,
];

export function getCategory(id: string) {
  return CATEGORIES.find((c) => c.id === id);
}

export function getTool(id: string) {
  return TOOLS.find((t) => t.id === id);
}

export function toolsForCategory(categoryId: string) {
  if (categoryId === "fun") {
    return TOOLS.filter((t) => t.active && t.funGroup);
  }
  if (categoryId === "editing") {
    return TOOLS.filter((t) => t.active && t.editGroup);
  }
  if (categoryId === "restoration") {
    return TOOLS.filter((t) => t.active && t.restoreGroup);
  }
  if (categoryId === "portrait") {
    return TOOLS.filter((t) => t.active && t.portraitGroup);
  }
  if (categoryId === "styles") {
    return TOOLS.filter((t) => t.active && t.styleGroup);
  }
  if (categoryId === "print") {
    return TOOLS.filter((t) => t.active && t.printGroup);
  }
  if (categoryId === "autofix") {
    return TOOLS.filter((t) => t.active && t.autofixGroup);
  }
  if (categoryId === "rescue") {
    return TOOLS.filter((t) => t.active && t.rescueGroup);
  }
  if (categoryId === "clothing") {
    return TOOLS.filter((t) => t.active && t.clothingGroup);
  }
  if (categoryId === "toolkit") {
    return TOOLS.filter((t) => t.active && t.toolkitGroup);
  }
  if (categoryId === "smart") {
    return TOOLS.filter((t) => t.active && t.category === "smart");
  }
  if (categoryId === "social") {
    return TOOLS.filter((t) => t.active && t.socialGroup);
  }
  return TOOLS.filter((t) => t.category === categoryId && t.active);
}

export function toolsForFunGroup(group: FunGroupId) {
  return TOOLS.filter((t) => t.active && t.funGroup === group);
}

export function toolsForEditGroup(group: EditGroupId) {
  return TOOLS.filter((t) => t.active && t.editGroup === group);
}

export function toolsForRestoreGroup(group: RestoreGroupId) {
  return TOOLS.filter((t) => t.active && t.restoreGroup === group);
}

export function toolsForPortraitGroup(group: PortraitGroupId) {
  return TOOLS.filter((t) => t.active && t.portraitGroup === group);
}

export function toolsForStyleGroup(group: StyleGroupId) {
  return TOOLS.filter((t) => t.active && t.styleGroup === group);
}

export function toolsForPrintGroup(group: PrintGroupId) {
  return TOOLS.filter((t) => t.active && t.printGroup === group);
}

export function toolsForAutofixGroup(group: AutofixGroupId) {
  return TOOLS.filter((t) => t.active && t.autofixGroup === group);
}

export function toolsForRescueGroup(group: RescueGroupId) {
  return TOOLS.filter((t) => t.active && t.rescueGroup === group);
}

export function toolsForClothingGroup(group: ClothingGroupId) {
  return TOOLS.filter((t) => t.active && t.clothingGroup === group);
}

export function toolsForToolkitGroup(group: ToolkitGroupId) {
  return TOOLS.filter((t) => t.active && t.toolkitGroup === group);
}

export function toolsForSocialGroup(group: SocialGroupId) {
  return TOOLS.filter((t) => t.active && t.socialGroup === group);
}

export function allActiveTools() {
  return TOOLS.filter((t) => t.active);
}
