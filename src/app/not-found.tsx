import Link from "next/link";
import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 p-8 text-center">
      <Logo />
      <div>
        <p className="font-mono text-xs text-text-muted">404</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">This page doesn&apos;t exist</h1>
        <p className="mt-2 max-w-sm text-sm text-text-secondary">
          The link may be out of date, or the page may have moved.
        </p>
      </div>
      <Button asChild>
        <Link href="/dashboard">Back to Songbook</Link>
      </Button>
    </div>
  );
}
