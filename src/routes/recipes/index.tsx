import { createFileRoute, Link } from "@tanstack/react-router";
import { TopBar } from "@/components/layout/TopBar";
import { RECIPES } from "@/lib/tools/recipes";
import { getTool } from "@/lib/tools/catalog";

export const Route = createFileRoute("/recipes/")({ component: RecipesPage });

function RecipesPage() {
  return (
    <div>
      <TopBar title="Recipes" backTo="/" />
      <div className="px-5 py-4">
        <h1 className="font-display text-3xl font-medium">Recipes</h1>
        <p className="mt-1 text-sm text-muted">
          Two or three tools in order. Preview each step. Originals stay safe.
        </p>
        <ul className="mt-5 flex flex-col gap-2">
          {RECIPES.map((recipe) => (
            <li key={recipe.id}>
              <Link
                to="/recipes/$recipeId"
                params={{ recipeId: recipe.id }}
                className="block min-h-16 rounded-xl bg-surface px-3 py-3 shadow-[var(--shadow-border)]"
              >
                <span className="block font-medium">{recipe.name}</span>
                <span className="block text-sm text-muted">{recipe.description}</span>
                <span className="mt-1 block text-xs text-subtle">
                  {recipe.steps
                    .map((step) => getTool(step.toolId)?.name ?? step.label)
                    .join(" → ")}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
