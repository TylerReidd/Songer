"use client";

import { Loader2, Plus } from "lucide-react";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { createSong } from "@/lib/songs/actions";

/**
 * Calls the createSong Server Action, which inserts the row and redirects to
 * the new editor. useTransition keeps the button in a pending state until
 * the redirect lands.
 */
export function NewSongButton() {
  const [isPending, startTransition] = useTransition();

  return (
    <Button disabled={isPending} onClick={() => startTransition(async () => { await createSong(); })}>
      {isPending ? <Loader2 className="animate-spin" data-icon="inline-start" /> : <Plus data-icon="inline-start" />}
      New song
    </Button>
  );
}
