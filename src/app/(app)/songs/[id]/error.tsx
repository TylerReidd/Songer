"use client";

import Link from "next/link";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

/** Editor-specific boundary so a failure here never takes the whole shell down. */
export default function SongError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col items-center px-4 py-24 text-center">
      <div className="mb-4 flex size-11 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <AlertTriangle className="size-5" aria-hidden="true" />
      </div>
      <h1 className="text-lg font-semibold">The editor hit a problem</h1>
      <p className="mt-1.5 max-w-sm text-sm text-text-secondary">
        Nothing you saved has been lost. Reload the editor, or go back to your library.
      </p>
      <div className="mt-5 flex gap-2">
        <Button onClick={reset}>
          <RotateCcw data-icon="inline-start" />
          Reload editor
        </Button>
        <Button variant="outline" asChild>
          <Link href="/songs">My songs</Link>
        </Button>
      </div>
    </div>
  );
}
