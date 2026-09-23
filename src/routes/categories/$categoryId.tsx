import { createFileRoute, Link } from "@tanstack/react-router";
import { ToolGrid } from "@/components/categories/ToolGrid";
import { TopBar } from "@/components/layout/TopBar";
import {
  getCategory,
  toolsForAutofixGroup,
  toolsForCategory,
  toolsForClothingGroup,
  toolsForEditGroup,
  toolsForFunGroup,
  toolsForPortraitGroup,
  toolsForPrintGroup,
  toolsForRescueGroup,
  toolsForRestoreGroup,
  toolsForSocialGroup,
  toolsForStyleGroup,
  toolsForToolkitGroup,
} from "@/lib/tools/catalog";
import { AUTOFIX_GROUPS } from "@/lib/tools/autofix-tools";
import { CLOTHING_GROUPS } from "@/lib/tools/clothing-tools";
import { EDIT_GROUPS } from "@/lib/tools/editing-tools";
import { FUN_GROUPS } from "@/lib/tools/fun-tools";
import { PORTRAIT_GROUPS } from "@/lib/tools/portrait-tools";
import { PRINT_GROUPS } from "@/lib/tools/print-tools";
import { RESCUE_GROUPS } from "@/lib/tools/rescue-tools";
import { RESTORE_GROUPS } from "@/lib/tools/restoration-tools";
import { SOCIAL_GROUPS } from "@/lib/tools/social-tools";
import { STYLE_GROUPS } from "@/lib/tools/style-tools";
import { TOOLKIT_GROUPS } from "@/lib/tools/toolkit-tools";
import type { ToolDefinition, ToolSection } from "@/lib/tools/types";

export const Route = createFileRoute("/categories/$categoryId")({
  component: CategoryPage,
});

const SECTION_LABEL: Record<ToolSection, string> = {
  main: "Tools",
  reusable: "Reusable tools",
  advanced: "Advanced editing",
};

function CategoryPage() {
  const { categoryId } = Route.useParams();
  const category = getCategory(categoryId);
  const tools = toolsForCategory(categoryId);

  if (!category) {
    return (
      <div>
        <TopBar title="Categories" backTo="/categories" />
        <p className="px-5 py-6 text-sm text-muted">That category does not exist.</p>
      </div>
    );
  }

  return (
    <div>
      <TopBar title={category.shortName} backTo="/categories" />
      <div className="px-5 py-4">
        <h1 className="font-display text-3xl font-medium">{category.name}</h1>
        <p className="mt-1 text-sm text-muted">{category.description}</p>
        <p className="mt-4 text-xs text-subtle">
          Need a different photograph?{" "}
          <Link to="/" className="text-accent">
            Upload another
          </Link>
        </p>

        {category.id === "fun" ? (
          <NamedGroups
            groups={FUN_GROUPS}
            getTools={(id) => toolsForFunGroup(id as (typeof FUN_GROUPS)[number]["id"])}
          />
        ) : category.id === "editing" ? (
          <NamedGroups
            groups={EDIT_GROUPS}
            getTools={(id) => toolsForEditGroup(id as (typeof EDIT_GROUPS)[number]["id"])}
          />
        ) : category.id === "restoration" ? (
          <NamedGroups
            groups={RESTORE_GROUPS}
            getTools={(id) =>
              toolsForRestoreGroup(id as (typeof RESTORE_GROUPS)[number]["id"])
            }
          />
        ) : category.id === "portrait" ? (
          <NamedGroups
            groups={PORTRAIT_GROUPS}
            getTools={(id) =>
              toolsForPortraitGroup(id as (typeof PORTRAIT_GROUPS)[number]["id"])
            }
          />
        ) : category.id === "styles" ? (
          <NamedGroups
            groups={STYLE_GROUPS}
            getTools={(id) =>
              toolsForStyleGroup(id as (typeof STYLE_GROUPS)[number]["id"])
            }
          />
        ) : category.id === "print" ? (
          <NamedGroups
            groups={PRINT_GROUPS}
            getTools={(id) =>
              toolsForPrintGroup(id as (typeof PRINT_GROUPS)[number]["id"])
            }
          />
        ) : category.id === "autofix" ? (
          <NamedGroups
            groups={AUTOFIX_GROUPS}
            getTools={(id) =>
              toolsForAutofixGroup(id as (typeof AUTOFIX_GROUPS)[number]["id"])
            }
          />
        ) : category.id === "rescue" ? (
          <NamedGroups
            groups={RESCUE_GROUPS}
            getTools={(id) =>
              toolsForRescueGroup(id as (typeof RESCUE_GROUPS)[number]["id"])
            }
          />
        ) : category.id === "clothing" ? (
          <NamedGroups
            groups={CLOTHING_GROUPS}
            getTools={(id) =>
              toolsForClothingGroup(id as (typeof CLOTHING_GROUPS)[number]["id"])
            }
          />
        ) : category.id === "toolkit" ? (
          <NamedGroups
            groups={TOOLKIT_GROUPS}
            getTools={(id) =>
              toolsForToolkitGroup(id as (typeof TOOLKIT_GROUPS)[number]["id"])
            }
          />
        ) : category.id === "social" ? (
          <NamedGroups
            groups={SOCIAL_GROUPS}
            getTools={(id) =>
              toolsForSocialGroup(id as (typeof SOCIAL_GROUPS)[number]["id"])
            }
          />
        ) : (
          <StandardGroups categoryId={category.id} tools={tools} />
        )}
      </div>
    </div>
  );
}

function NamedGroups({
  groups,
  getTools,
}: {
  groups: { id: string; name: string; description: string }[];
  getTools: (id: string) => ToolDefinition[];
}) {
  return (
    <div className="mt-6 flex flex-col gap-8">
      {groups.map((group) => (
        <section key={group.id}>
          <h2 className="font-display text-xl font-medium">{group.name}</h2>
          <p className="mt-1 mb-3 text-sm text-muted">{group.description}</p>
          <ToolGrid tools={getTools(group.id)} />
        </section>
      ))}
    </div>
  );
}

function StandardGroups({
  categoryId,
  tools,
}: {
  categoryId: string;
  tools: ReturnType<typeof toolsForCategory>;
}) {
  const groups: ToolSection[] =
    categoryId === "editing" ? ["reusable", "advanced"] : ["main"];
  const grouped = groups
    .map((section) => ({
      section,
      tools:
        section === "main"
          ? tools.filter((t) => !t.section || t.section === "main")
          : tools.filter((t) => t.section === section),
    }))
    .filter((g) => g.tools.length > 0);

  return (
    <div className="mt-6 flex flex-col gap-8">
      {grouped.map((group) => (
        <section key={group.section}>
          {grouped.length > 1 ? (
            <h2 className="mb-2 text-sm font-medium text-muted">
              {SECTION_LABEL[group.section]}
            </h2>
          ) : null}
          <ToolGrid tools={group.tools} />
        </section>
      ))}
    </div>
  );
}
