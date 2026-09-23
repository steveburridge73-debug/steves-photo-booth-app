import {
  AUTOFIX_SAFETY,
  CLOTHING_SAFETY,
  CREATIVE_IDENTITY,
  FACE_SAFETY,
  NO_INVENTED,
  NO_UNREQUESTED,
  ORIGINAL_PROTECTED,
  PORTRAIT_IDENTITY,
  QUALITY_RULE,
  RESCUE_SAFETY,
  RESTORATION_SAFETY,
  STRICT_IDENTITY,
  TOOLKIT_SAFETY,
} from "./identity";
import type { ToolDefinition, ToolField, ToolVariant } from "./types";

export function interpolate(
  template: string,
  fields: Record<string, string>,
  defs: ToolField[] = [],
) {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => {
    const value = (fields[key] ?? "").trim();
    if (value) return value;
    const def = defs.find((f) => f.id === key);
    return def?.fallback ?? "as suggested by the photograph";
  });
}

export function missingRequiredFields(
  tool: ToolDefinition,
  fields: Record<string, string>,
) {
  const missing: string[] = [];
  for (const field of tool.fields ?? []) {
    if (!field.required) continue;
    const value = (fields[field.id] ?? "").trim();
    if (!value) missing.push(field.label);
  }
  return missing;
}

export function defaultFieldValues(tool: ToolDefinition): Record<string, string> {
  const values: Record<string, string> = {};
  for (const field of tool.fields ?? []) {
    if (field.defaultValue) values[field.id] = field.defaultValue;
    else if (field.type === "select" && field.options?.[0]) {
      values[field.id] = field.options[0].value;
    } else {
      values[field.id] = "";
    }
  }
  return values;
}

export function buildPrompt(
  tool: ToolDefinition,
  fields: Record<string, string>,
  extra?: string,
  variant?: ToolVariant,
) {
  const identity =
    tool.identityPreservation === "strict" ? STRICT_IDENTITY : CREATIVE_IDENTITY;
  const safety =
    tool.category === "restoration" || tool.restoreGroup ? RESTORATION_SAFETY : "";
  const portrait =
    tool.category === "portrait" || tool.portraitGroup ? PORTRAIT_IDENTITY : "";
  const autofix =
    tool.category === "autofix" || tool.autofixGroup ? AUTOFIX_SAFETY : "";
  const rescue =
    tool.category === "rescue" || tool.rescueGroup ? RESCUE_SAFETY : "";
  const clothing =
    tool.category === "clothing" || tool.clothingGroup ? CLOTHING_SAFETY : "";
  const toolkit =
    tool.category === "toolkit" || tool.toolkitGroup ? TOOLKIT_SAFETY : "";
  const smart = tool.category === "smart" ? AUTOFIX_SAFETY : "";
  const faces = tool.editGroup === "faces" ? FACE_SAFETY : "";
  const main = interpolate(tool.mainPrompt, fields, tool.fields);
  const variantLine = variant?.prompt?.trim() ?? "";
  const extraLine = extra?.trim()
    ? `Additional instruction from the user: ${extra.trim()}`
    : "";
  return [
    identity,
    ORIGINAL_PROTECTED,
    NO_UNREQUESTED,
    NO_INVENTED,
    QUALITY_RULE,
    safety,
    portrait,
    autofix,
    rescue,
    clothing,
    toolkit,
    smart,
    faces,
    main,
    variantLine,
    extraLine,
    tool.outputFormat,
  ]
    .filter(Boolean)
    .join("\n\n");
}
