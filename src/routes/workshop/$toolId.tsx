import { createFileRoute } from "@tanstack/react-router";
import { WorkshopScreen } from "@/components/workshop/WorkshopScreen";

type WorkshopSearch = {
  photo?: string;
  from?: string;
  saved?: string;
};

export const Route = createFileRoute("/workshop/$toolId")({
  validateSearch: (search: Record<string, unknown>): WorkshopSearch => ({
    photo: typeof search.photo === "string" ? search.photo : undefined,
    from: typeof search.from === "string" ? search.from : undefined,
    saved: typeof search.saved === "string" ? search.saved : undefined,
  }),
  component: WorkshopRoute,
});

function WorkshopRoute() {
  const { toolId } = Route.useParams();
  const { photo, from, saved } = Route.useSearch();
  return (
    <WorkshopScreen
      toolId={toolId}
      photoId={photo}
      fromResultId={from}
      savedPromptId={saved}
    />
  );
}
