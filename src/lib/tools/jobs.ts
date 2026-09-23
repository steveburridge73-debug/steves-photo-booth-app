export const JOBS = [
  {
    id: "restore",
    title: "Restore this",
    hint: "Old, faded or damaged",
    kind: "category" as const,
    target: "restoration",
  },
  {
    id: "fix",
    title: "Fix this photo",
    hint: "Analyse, then you approve",
    kind: "workshop" as const,
    target: "smart-auto-fix",
  },
  {
    id: "clothes",
    title: "Change clothes",
    hint: "Outfit only. Face stays",
    kind: "category" as const,
    target: "clothing",
  },
  {
    id: "portrait",
    title: "Make a portrait",
    hint: "From a selfie",
    kind: "category" as const,
    target: "portrait",
  },
  {
    id: "fun",
    title: "Have a laugh",
    hint: "Toys, cartoons, worlds",
    kind: "category" as const,
    target: "fun",
  },
  {
    id: "print",
    title: "Make a print",
    hint: "Cards, collages, frames",
    kind: "category" as const,
    target: "print",
  },
] as const;
