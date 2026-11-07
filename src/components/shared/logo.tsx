import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  href?: string;
  className?: string;
  /** Hide the wordmark and show only the mark. */
  compact?: boolean;
}

/** Songbook wordmark. A simple inline SVG keeps it crisp at any size. */
export function Logo({ href = "/", className, compact = false }: LogoProps) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center gap-2 rounded-md text-foreground outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
        className,
      )}
      aria-label="Songbook home"
    >
      <LogoMark />
      {!compact && <span className="text-[15px] font-semibold tracking-tight">Songbook</span>}
    </Link>
  );
}

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={cn("size-6 text-brand", className)}
      fill="none"
    >
      <rect x="2.5" y="2.5" width="19" height="19" rx="5" className="fill-brand-subtle" />
      <path
        d="M9.25 16.25V7.75l6.5-1.5v8.25"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="7.75" cy="16.25" r="1.75" fill="currentColor" />
      <circle cx="14.25" cy="14.5" r="1.75" fill="currentColor" />
    </svg>
  );
}
