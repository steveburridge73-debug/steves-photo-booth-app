import { DEFAULT_OUTPUT } from "./identity";
import type { ToolDefinition } from "./types";

export const SMART_TOOLS: ToolDefinition[] = [
  {
    id: "smart-auto-fix",
    category: "smart",
    name: "Smart Auto Fix",
    shortDescription: "Analyse first. You choose which fixes to apply.",
    icon: "scanSearch",
    identityPreservation: "strict",
    version: 1,
    active: true,
    note: "Nothing is changed until you approve the recommended fixes. Original stays safe.",
    fields: [
      {
        id: "selected",
        label: "Recommended fixes",
        type: "toggles",
        help: "Turn off anything you do not want. Major creative changes are never applied automatically.",
        fallback: "none — do not change the photograph",
      },
    ],
    mainPrompt:
      "Automatically improve this photograph using only these selected fixes:\n{{selected}}\n\nDo not make major creative or stylistic changes. Do not change identity, clothing, pose, people or composition except where a selected fix requires a small straighten or crop. Preserve everything else. The result should look like a carefully corrected version of the same photograph.",
    outputFormat: DEFAULT_OUTPUT,
  },
];
