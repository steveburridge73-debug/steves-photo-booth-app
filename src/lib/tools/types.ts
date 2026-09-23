export const CATEGORY_IDS = [
  "fun",
  "editing",
  "restoration",
  "portrait",
  "styles",
  "print",
  "autofix",
  "rescue",
  "clothing",
  "toolkit",
  "smart",
  "social",
] as const;

export type CategoryId = (typeof CATEGORY_IDS)[number];

export const FUN_GROUP_IDS = [
  "toys",
  "funny",
  "weird",
  "movie",
  "retro",
  "collages",
  "worlds",
] as const;

export type FunGroupId = (typeof FUN_GROUP_IDS)[number];

export const EDIT_GROUP_IDS = [
  "basic",
  "recreate",
  "objects",
  "quality",
  "people",
  "faces",
  "advanced",
] as const;

export type EditGroupId = (typeof EDIT_GROUP_IDS)[number];

export const RESTORE_GROUP_IDS = ["repair", "colour", "complete"] as const;

export type RestoreGroupId = (typeof RESTORE_GROUP_IDS)[number];

export const PORTRAIT_GROUP_IDS = [
  "studio",
  "editorial",
  "branding",
  "finishing",
  "builder",
] as const;

export type PortraitGroupId = (typeof PORTRAIT_GROUP_IDS)[number];

export const STYLE_GROUP_IDS = [
  "transfer",
  "photographic",
  "artistic",
  "posters",
] as const;

export type StyleGroupId = (typeof STYLE_GROUP_IDS)[number];

export const PRINT_GROUP_IDS = ["memories", "collages", "cards"] as const;

export type PrintGroupId = (typeof PRINT_GROUP_IDS)[number];

export const AUTOFIX_GROUP_IDS = [
  "travel",
  "urban",
  "events",
  "food",
  "fashion",
  "vehicles",
  "weather",
  "celebrations",
  "ecommerce",
  "documents",
  "garden",
] as const;

export type AutofixGroupId = (typeof AUTOFIX_GROUP_IDS)[number];

export const RESCUE_GROUP_IDS = ["clarity", "exposure", "damaged"] as const;

export type RescueGroupId = (typeof RESCUE_GROUP_IDS)[number];

export const CLOTHING_GROUP_IDS = ["swap", "play", "extras", "builder"] as const;

export type ClothingGroupId = (typeof CLOTHING_GROUP_IDS)[number];

export const TOOLKIT_GROUP_IDS = ["erase", "fill", "sky", "scene"] as const;

export type ToolkitGroupId = (typeof TOOLKIT_GROUP_IDS)[number];

export const SOCIAL_GROUP_IDS = ["social", "print", "custom"] as const;

export type SocialGroupId = (typeof SOCIAL_GROUP_IDS)[number];

export type IdentityMode = "strict" | "creative";

export type FieldType = "text" | "textarea" | "select" | "toggles";

export type ToolField = {
  id: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  help?: string;
  required?: boolean;
  defaultValue?: string;
  fallback?: string;
  options?: { value: string; label: string }[];
};

export type ToolVariant = {
  id: string;
  label: string;
  prompt: string;
};

export type IconKey =
  | "smile"
  | "shirt"
  | "clock"
  | "clapperboard"
  | "personStanding"
  | "sliders"
  | "crop"
  | "frame"
  | "imageOff"
  | "aperture"
  | "eraser"
  | "wand"
  | "history"
  | "bandage"
  | "droplets"
  | "scanSearch"
  | "user"
  | "briefcase"
  | "sun"
  | "palette"
  | "film"
  | "camera"
  | "contrast"
  | "layers"
  | "mail"
  | "printer"
  | "layoutGrid"
  | "package"
  | "gift"
  | "box"
  | "blocks"
  | "laugh"
  | "pencil"
  | "shield"
  | "meh"
  | "landmark"
  | "maximize"
  | "paw"
  | "cat"
  | "cloud"
  | "globe"
  | "bird"
  | "drama"
  | "ticket"
  | "tv"
  | "userRound"
  | "cassette"
  | "album"
  | "sticky"
  | "stamp"
  | "images"
  | "arrows"
  | "puzzle"
  | "ratio"
  | "expand"
  | "userX"
  | "type"
  | "eye"
  | "scanEye"
  | "scanFace"
  | "rotate"
  | "lamp"
  | "shoppingBag"
  | "move3d"
  | "focus"
  | "paintbrush"
  | "penTool"
  | "calendar"
  | "mountain"
  | "moon"
  | "house"
  | "car"
  | "sparkles"
  | "music"
  | "utensils"
  | "fileText";

export type ToolSection = "main" | "reusable" | "advanced";

export type ToolDefinition = {
  id: string;
  category: CategoryId;
  name: string;
  shortDescription: string;
  icon: IconKey;
  mainPrompt: string;
  fields?: ToolField[];
  example?: string;
  note?: string;
  identityPreservation: IdentityMode;
  outputFormat: string;
  version: number;
  active: boolean;
  reusable?: boolean;
  extraImages?: number;
  section?: ToolSection;
  funGroup?: FunGroupId;
  editGroup?: EditGroupId;
  restoreGroup?: RestoreGroupId;
  portraitGroup?: PortraitGroupId;
  styleGroup?: StyleGroupId;
  printGroup?: PrintGroupId;
  autofixGroup?: AutofixGroupId;
  rescueGroup?: RescueGroupId;
  clothingGroup?: ClothingGroupId;
  toolkitGroup?: ToolkitGroupId;
  socialGroup?: SocialGroupId;
  variants?: ToolVariant[];
};

export type CategoryDefinition = {
  id: CategoryId;
  name: string;
  shortName: string;
  description: string;
  icon: IconKey;
};

export type FunGroupDefinition = {
  id: FunGroupId;
  name: string;
  description: string;
};

export type EditGroupDefinition = {
  id: EditGroupId;
  name: string;
  description: string;
};

export type RestoreGroupDefinition = {
  id: RestoreGroupId;
  name: string;
  description: string;
};

export type PortraitGroupDefinition = {
  id: PortraitGroupId;
  name: string;
  description: string;
};

export type StyleGroupDefinition = {
  id: StyleGroupId;
  name: string;
  description: string;
};

export type PrintGroupDefinition = {
  id: PrintGroupId;
  name: string;
  description: string;
};

export type AutofixGroupDefinition = {
  id: AutofixGroupId;
  name: string;
  description: string;
};

export type RescueGroupDefinition = {
  id: RescueGroupId;
  name: string;
  description: string;
};

export type ClothingGroupDefinition = {
  id: ClothingGroupId;
  name: string;
  description: string;
};

export type ToolkitGroupDefinition = {
  id: ToolkitGroupId;
  name: string;
  description: string;
};

export type SocialGroupDefinition = {
  id: SocialGroupId;
  name: string;
  description: string;
};
