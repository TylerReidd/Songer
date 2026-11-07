import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, History, Layers, Library, Music4, PenLine } from "lucide-react";
import { ProductPreview } from "@/components/marketing/product-preview";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Songbook · Every song starts somewhere",
  description:
    "A home for your lyrics, melodies, fragments, and unfinished ideas. Write freely. Organize naturally. Keep creating.",
  openGraph: {
    title: "Songbook",
    description: "A focused songwriting workspace for lyrics, structure, and ideas.",
    type: "website",
  },
};

const FEATURES = [
  {
    icon: Library,
    title: "Organized song library",
    description:
      "Every song in one place, with status, key, and tempo at a glance. Search, filter, and favorite so nothing gets lost.",
  },
  {
    icon: PenLine,
    title: "Focused lyric editor",
    description:
      "A calm writing surface with typography built for long-form lyrics. Autosave keeps your words safe while you work.",
  },
  {
    icon: Layers,
    title: "Flexible song sections",
    description:
      "Verses, choruses, bridges, and anything custom. Drag to rearrange, duplicate, and reshape the structure as the song finds itself.",
  },
  {
    icon: History,
    title: "Version history",
    description:
      "Save named snapshots before a big rewrite. Compare and restore earlier versions without fear of losing the one that worked.",
  },
  {
    icon: Music4,
    title: "Musical metadata",
    description:
      "Key, tempo, time signature, capo, and tuning live beside the lyrics, so the musical side of the song stays with the words.",
  },
];

export default function LandingPage() {
  return (
    <>
      <section className="relative overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[520px] bg-[radial-gradient(60%_50%_at_50%_0%,var(--brand-subtle),transparent_70%)]"
        />
        <div className="mx-auto max-w-6xl px-4 pt-20 pb-16 text-center sm:px-6 md:pt-28">
          <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-border/80 bg-surface-elevated/60 px-3 py-1 text-xs text-text-secondary">
            <span className="size-1.5 rounded-full bg-brand" aria-hidden="true" />
            A songwriting workspace
          </p>
          <h1 className="mx-auto max-w-3xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl md:text-6xl">
            Every song starts somewhere.
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-text-secondary text-pretty">
            A home for your lyrics, melodies, fragments, and unfinished ideas. Write freely.
            Organize naturally. Keep creating.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button size="lg" className="h-10 px-5 text-[15px]" asChild>
              <Link href="/sign-up">
                Start writing
                <ArrowRight data-icon="inline-end" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="h-10 px-5 text-[15px]" asChild>
              <Link href="/#features">Explore features</Link>
            </Button>
          </div>
        </div>
        <div className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
          <ProductPreview />
        </div>
      </section>

      <section id="features" className="scroll-mt-20 border-t">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-semibold tracking-tight">Built for the way songs actually happen</h2>
            <p className="mt-3 text-[15px] leading-relaxed text-text-secondary">
              Songs arrive as fragments: a line in the shower, a chord progression on a voice memo,
              a title with no song attached. Songbook keeps the pieces close until they become
              something.
            </p>
          </div>
          <ul className="mt-12 grid gap-px overflow-hidden rounded-xl border bg-border sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature) => (
              <li key={feature.title} className="bg-background p-6">
                <div className="mb-4 flex size-9 items-center justify-center rounded-lg bg-brand-subtle text-brand">
                  <feature.icon className="size-4.5" aria-hidden="true" />
                </div>
                <h3 className="text-[15px] font-semibold">{feature.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-text-secondary">{feature.description}</p>
              </li>
            ))}
            <li className="flex flex-col justify-between bg-surface-elevated p-6">
              <div>
                <h3 className="text-[15px] font-semibold">Not another DAW</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-text-secondary">
                  Songbook is for the writing. No timelines, no plugins, no notation. Just a place to
                  keep the song honest.
                </p>
              </div>
              <Link
                href="/sign-up"
                className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-brand hover:text-brand-hover"
              >
                Get started
                <ArrowRight className="size-3.5" aria-hidden="true" />
              </Link>
            </li>
          </ul>
        </div>
      </section>

      <section id="about" className="scroll-mt-20 border-t">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-20 sm:px-6 md:grid-cols-[1fr_1fr]">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight">Why Songbook</h2>
            <p className="mt-3 text-[15px] leading-relaxed text-text-secondary">
              Most songwriters keep their work scattered across notes apps, voice memos, and old
              notebooks. Finding last month&apos;s half-finished chorus becomes its own project.
            </p>
            <p className="mt-3 text-[15px] leading-relaxed text-text-secondary">
              Songbook is a single, quiet place for that material. It is designed for late nights,
              long sessions, and the slow work of turning fragments into finished songs.
            </p>
          </div>
          <div className="rounded-xl border bg-surface-elevated p-6">
            <h3 className="text-xs font-semibold tracking-wider text-text-muted uppercase">On the roadmap</h3>
            <ul className="mt-4 grid gap-2 text-sm text-text-secondary sm:grid-cols-2">
              {[
                "Voice memo attachments",
                "Chord diagrams",
                "Collaboration",
                "PDF and Markdown export",
                "Offline writing",
                "Mobile companion",
              ].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <span className="size-1 rounded-full bg-text-muted" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
            <p className="mt-5 text-xs text-text-muted">
              The current release focuses on writing, structure, and version history.
            </p>
          </div>
        </div>
      </section>

      <section className="border-t">
        <div className="mx-auto max-w-6xl px-4 py-20 text-center sm:px-6">
          <h2 className="text-3xl font-semibold tracking-tight">Start with a line. Finish with a song.</h2>
          <p className="mx-auto mt-3 max-w-md text-[15px] text-text-secondary">
            Create a free account and bring your fragments home.
          </p>
          <Button size="lg" className="mt-7 h-10 px-5 text-[15px]" asChild>
            <Link href="/sign-up">
              Start writing
              <ArrowRight data-icon="inline-end" />
            </Link>
          </Button>
        </div>
      </section>
    </>
  );
}
