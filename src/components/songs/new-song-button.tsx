"use client";

import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

/**
 * Phase 1: opens the blank sample song so the empty editor state can be
 * reviewed. Phase 2 calls the createSong Server Action and redirects to the
 * new id.
 */
export function NewSongButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      disabled={isPending}
      onClick={() => {
        toast("Opening a blank sample song.", {
          description: "Creating real songs arrives with the database in Phase 2.",
        });
        startTransition(() => router.push("/songs/song_untitled"));
      }}
    >
      <Plus data-icon="inline-start" />
      New song
    </Button>
  );
}
