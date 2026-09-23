import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { ToolGrid } from "@/components/categories/ToolGrid";
import { searchTools } from "@/lib/tools/search";

export function ToolSearch({ label = "Search tools" }: { label?: string }) {
  const [query, setQuery] = useState("");
  const matches = useMemo(() => searchTools(query), [query]);

  return (
    <div>
      <label htmlFor="tool-search" className="text-sm font-medium">
        {label}
      </label>
      <Input
        id="tool-search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="e.g. red eye, Polaroid, sky"
        className="mt-2"
        autoComplete="off"
      />
      {query.trim().length >= 2 ? (
        <div className="mt-3">
          {matches.length === 0 ? (
            <p className="text-sm text-muted">No tools match that.</p>
          ) : (
            <ToolGrid tools={matches} />
          )}
        </div>
      ) : null}
    </div>
  );
}
