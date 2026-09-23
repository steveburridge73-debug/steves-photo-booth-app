import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { TopBar } from "@/components/layout/TopBar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getSavedPrompt, updateSavedPrompt } from "@/lib/storage/prompts";

export const Route = createFileRoute("/prompts/$promptId")({
  component: EditSavedPromptPage,
});

function EditSavedPromptPage() {
  const { promptId } = Route.useParams();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [prompt, setPrompt] = useState("");
  const [extra, setExtra] = useState("");
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    void getSavedPrompt(promptId).then((item) => {
      if (!item) {
        setMissing(true);
        return;
      }
      setName(item.name);
      setCategory(item.category);
      setPrompt(item.prompt);
      setExtra(item.extra ?? "");
    });
  }, [promptId]);

  if (missing) {
    return (
      <div>
        <TopBar title="Saved Prompts" backTo="/prompts" />
        <p className="px-5 py-6 text-sm text-muted">That saved prompt is not here.</p>
      </div>
    );
  }

  return (
    <div>
      <TopBar title="Edit prompt" backTo="/prompts" />
      <form
        className="flex flex-col gap-4 px-5 py-4"
        onSubmit={async (e) => {
          e.preventDefault();
          await updateSavedPrompt(promptId, {
            name,
            category,
            prompt,
            extra: extra.trim() || undefined,
          });
          toast.success("Saved prompt updated. Built-in tools unchanged.");
          void navigate({ to: "/prompts" });
        }}
      >
        <p className="text-xs text-subtle">
          This is your copy. Built-in Photo Fixer prompts cannot be overwritten.
        </p>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="name">Name</Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="category">Category</Label>
          <Input
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="e.g. Fun, Custom, Rescue"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="prompt">Prompt</Label>
          <Textarea
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="min-h-40"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="extra">Extra instruction</Label>
          <Textarea id="extra" value={extra} onChange={(e) => setExtra(e.target.value)} />
        </div>
        <Button type="submit" size="lg">
          Save changes
        </Button>
      </form>
    </div>
  );
}
