import { GripVertical, Star } from "lucide-react";

const SECTIONS = [
  {
    label: "Verse 1",
    lines: [
      "Left the porchlight on again",
      "like you might come walking through the rain",
      "the kettle's gone cold twice tonight",
      "and I keep setting out two plates",
    ],
  },
  {
    label: "Chorus",
    lines: ["But I'll leave the light on", "for whatever comes home", "moths or memory or you"],
  },
];

/**
 * A static, CSS-only rendering of the song editor used on the landing page.
 * It mirrors the real editor's layout so the preview stays honest.
 */
export function ProductPreview() {
  return (
    <div
      aria-label="Preview of the Songbook song editor"
      role="img"
      className="relative mx-auto w-full max-w-5xl overflow-hidden rounded-xl border bg-surface-editor shadow-[0_30px_80px_-30px_rgba(0,0,0,0.6)]"
    >
      <div className="flex h-9 items-center gap-1.5 border-b bg-sidebar px-3">
        <span className="size-2.5 rounded-full bg-border" />
        <span className="size-2.5 rounded-full bg-border" />
        <span className="size-2.5 rounded-full bg-border" />
        <span className="ml-3 font-mono text-[10px] text-text-muted">songbook.app / songs / porchlight</span>
      </div>
      <div className="grid grid-cols-[1fr] text-left md:grid-cols-[168px_1fr_200px]">
        <div className="hidden flex-col gap-1 border-r bg-sidebar p-3 md:flex">
          {["Dashboard", "My Songs", "Ideas", "Favorites"].map((item, index) => (
            <div
              key={item}
              className={`rounded-md px-2 py-1.5 text-[11px] ${index === 1 ? "bg-sidebar-accent text-foreground" : "text-text-secondary"}`}
            >
              {item}
            </div>
          ))}
          <div className="mt-4 mb-1 px-2 text-[9px] font-semibold tracking-wider text-text-muted uppercase">
            Recent
          </div>
          {["Porchlight", "Salt and Static", "Slow Dancer"].map((title, index) => (
            <div
              key={title}
              className={`truncate rounded-md px-2 py-1 text-[11px] ${index === 0 ? "text-brand" : "text-text-secondary"}`}
            >
              {title}
            </div>
          ))}
        </div>
        <div className="p-5 sm:p-7">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xl font-semibold tracking-tight">Porchlight</span>
              <Star className="size-3.5 fill-brand text-brand" aria-hidden="true" />
            </div>
            <span className="text-[10px] text-text-muted">Saved just now</span>
          </div>
          <div className="mt-1.5 flex gap-3 font-mono text-[10px] text-text-muted">
            <span>G major</span>
            <span>92 bpm</span>
            <span>4/4</span>
            <span>capo 2</span>
          </div>
          <div className="mt-6 space-y-5">
            {SECTIONS.map((section) => (
              <div key={section.label} className="rounded-lg border border-border/70 bg-background/40 p-4">
                <div className="mb-2.5 flex items-center gap-2">
                  <GripVertical className="size-3.5 text-text-muted" aria-hidden="true" />
                  <span className="text-[10px] font-semibold tracking-wider text-brand uppercase">
                    {section.label}
                  </span>
                </div>
                <div className="lyric-text space-y-0.5 text-[13.5px] leading-[1.75] text-foreground/90 sm:text-[15px]">
                  {section.lines.map((line) => (
                    <p key={line}>{line}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="hidden border-l bg-sidebar/60 p-4 md:block">
          <div className="mb-3 flex gap-3 border-b pb-2 text-[10px]">
            <span className="border-b-2 border-brand pb-2 text-foreground">Details</span>
            <span className="text-text-muted">Notes</span>
            <span className="text-text-muted">Versions</span>
          </div>
          {[
            ["Status", "In progress"],
            ["Key", "G major"],
            ["Tempo", "92 bpm"],
            ["Time", "4/4"],
            ["Capo", "2"],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between py-1.5 text-[11px]">
              <span className="text-text-muted">{label}</span>
              <span className="text-foreground">{value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
