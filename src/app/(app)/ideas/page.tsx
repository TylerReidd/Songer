import type { Metadata } from "next";
import { Lightbulb, SearchX } from "lucide-react";
import { IdeaCard } from "@/components/ideas/idea-card";
import { IdeaComposer } from "@/components/ideas/idea-composer";
import { IdeasSearch } from "@/components/ideas/ideas-search";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shell/page-header";
import { listIdeas } from "@/lib/ideas/queries";
import { requireUser } from "@/lib/session";
import { listSongTitles } from "@/lib/songs/queries";

export const metadata: Metadata = { title: "Ideas" };

export default async function IdeasPage({ searchParams }: PageProps<"/ideas">) {
  const { q } = await searchParams;
  const query = (Array.isArray(q) ? q[0] : q) ?? "";
  const user = await requireUser();
  const [ideas, songOptions] = await Promise.all([listIdeas(user.id, query), listSongTitles(user.id)]);

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <PageHeader title="Ideas" description="Fragments, titles, progressions. Capture now, sort later." />
      <div className="mt-6">
        <IdeaComposer />
      </div>
      <div className="mt-8">
        <IdeasSearch initialQuery={query} />
      </div>
      <div className="mt-4">
        {ideas.length === 0 ? (
          query ? (
            <EmptyState icon={SearchX} title="No ideas match" description="Try a different word or phrase." />
          ) : (
            <EmptyState
              icon={Lightbulb}
              title="No ideas yet"
              description="The box above is for anything too small to be a song. Yet."
            />
          )
        ) : (
          <ul className="flex flex-col gap-3">
            {ideas.map((idea) => (
              <li key={idea.id}>
                <IdeaCard idea={idea} songs={songOptions} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
