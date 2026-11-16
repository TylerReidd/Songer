import type { ReactNode } from "react";
import { SITE } from "@/lib/site";

/** Shared frame for the privacy policy and terms: a readable column with consistent heading styles. */
export function LegalPage({ title, intro, children }: { title: string; intro: string; children: ReactNode }) {
  return (
    <article className="mx-auto w-full max-w-2xl px-4 py-12 sm:px-6 lg:py-16">
      <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
      <p className="mt-2 text-sm text-text-muted">Last updated {SITE.legalUpdated}</p>
      <p className="mt-6 text-base leading-relaxed text-text-secondary">{intro}</p>
      <div className="mt-8 space-y-8 text-[15px] leading-relaxed text-text-secondary [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-foreground [&_h2]:mb-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1 [&_p+p]:mt-3 [&_a]:text-brand [&_a:hover]:text-brand-hover">
        {children}
      </div>
    </article>
  );
}

/** "Contact" sentence that works whether or not a public address is configured. */
export function ContactLine() {
  return SITE.contactEmail ? (
    <p>
      Questions about this policy or your data: <a href={`mailto:${SITE.contactEmail}`}>{SITE.contactEmail}</a>.
    </p>
  ) : (
    <p>
      Questions about this policy or your data: open an issue on the project&apos;s{" "}
      <a href={SITE.sourceUrl} rel="noreferrer" target="_blank">source repository</a>.
    </p>
  );
}
