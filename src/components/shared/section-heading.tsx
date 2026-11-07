import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { ReactNode } from "react";

interface SectionHeadingProps {
  title: string;
  description?: string;
  href?: string;
  hrefLabel?: string;
  action?: ReactNode;
}

/** Heading row for a dashboard or page section, with an optional "View all" link. */
export function SectionHeading({ title, description, href, hrefLabel = "View all", action }: SectionHeadingProps) {
  return (
    <div className="mb-4 flex items-end justify-between gap-4">
      <div>
        <h2 className="text-lg font-semibold tracking-tight text-foreground">{title}</h2>
        {description && <p className="mt-0.5 text-sm text-text-secondary">{description}</p>}
      </div>
      {action}
      {href && !action && (
        <Link
          href={href}
          className="inline-flex items-center gap-1 rounded-md text-sm text-text-secondary transition-colors outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          {hrefLabel}
          <ArrowRight className="size-3.5" aria-hidden="true" />
        </Link>
      )}
    </div>
  );
}
