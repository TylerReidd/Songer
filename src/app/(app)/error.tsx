"use client";

import { AlertTriangle, RotateCcw } from "lucide-react";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

/**
 * Error boundary for the app section. Must be a Client Component because it
 * receives the `reset` callback and can retry rendering the segment.
 */
export default function AppError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-1 items-center justify-center p-8">
      <div className="max-w-md text-center">
        <div className="mx-auto mb-4 flex size-11 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <AlertTriangle className="size-5" aria-hidden="true" />
        </div>
        <h1 className="text-lg font-semibold">Something went wrong</h1>
        <p className="mt-1.5 text-sm text-text-secondary">
          Your work is safe. Try loading this page again, and if it keeps happening, head back to the
          dashboard.
        </p>
        {error.digest && (
          <p className="mt-2 font-mono text-[11px] text-text-muted">Reference: {error.digest}</p>
        )}
        <div className="mt-5 flex justify-center gap-2">
          <Button onClick={reset}>
            <RotateCcw data-icon="inline-start" />
            Try again
          </Button>
          <Button variant="outline" asChild>
            <a href="/dashboard">Go to dashboard</a>
          </Button>
        </div>
      </div>
    </div>
  );
}
