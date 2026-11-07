import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SongEditor } from "@/components/editor/song-editor";
import { requireUser } from "@/lib/session";
import { getSongWithSections, listSongVersions } from "@/lib/songs/queries";

/**
 * Dynamic metadata: the tab title follows the song. Runs on the server, so
 * the lookup is cheap and never ships to the client. `cache()` inside
 * requireUser dedupes the session read with the page body below.
 */
export async function generateMetadata({ params }: PageProps<"/songs/[id]">): Promise<Metadata> {
  const { id } = await params;
  const user = await requireUser();
  const song = await getSongWithSections(user.id, id);
  return { title: song?.title ?? "Song not found" };
}

/**
 * Server Component. Loads the song and its versions with the acting user's
 * id baked into the query, so a song that isn't theirs is simply not found.
 * The editor itself is a Client Component because it owns live editing state.
 */
export default async function SongPage({ params }: PageProps<"/songs/[id]">) {
  const { id } = await params;
  const user = await requireUser();
  const song = await getSongWithSections(user.id, id);
  if (!song) notFound();
  const versions = await listSongVersions(user.id, id);

  // Keyed by id only: a save revalidates this route, which re-renders the page
  // with a new revision, but the editor must keep its client state (and the
  // user's in-flight typing) rather than remount from the server copy.
  return <SongEditor key={song.id} song={song} versions={versions} />;
}
