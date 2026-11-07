"use client";

import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import type { LyricFont } from "@/lib/domain/types";
import { updateLyricFont } from "@/lib/settings/actions";
import { cn } from "@/lib/utils";

const OPTIONS: Array<{ value: LyricFont; label: string; sample: string; className: string }> = [
  { value: "serif", label: "Serif", sample: "Left the porchlight on again", className: "font-lyric" },
  { value: "sans", label: "Sans", sample: "Left the porchlight on again", className: "font-sans" },
];

/**
 * Applies the preference immediately by flipping the data attribute that the
 * `.lyric-text` rule in globals.css reads, then persists it on the user
 * record so it follows them across devices.
 */
export function LyricFontPreference({ initial }: { initial: LyricFont }) {
  const [value, setValue] = useState<LyricFont>(initial);
  const [, startTransition] = useTransition();

  useEffect(() => {
    document.documentElement.dataset.lyricFont = value;
  }, [value]);

  return (
    <fieldset>
      <legend className="sr-only">Lyric font</legend>
      <div className="grid gap-3 sm:grid-cols-2">
        {OPTIONS.map((option) => {
          const id = `lyric-font-${option.value}`;
          const selected = value === option.value;
          return (
            <div key={option.value}>
              <input
                type="radio"
                id={id}
                name="lyricFont"
                value={option.value}
                checked={selected}
                onChange={() => {
                  setValue(option.value);
                  startTransition(async () => {
                    const result = await updateLyricFont(option.value);
                    if (result.ok) toast.success(`Lyric font set to ${option.label.toLowerCase()}`);
                    else toast.error(result.message);
                  });
                }}
                className="peer sr-only"
              />
              <Label
                htmlFor={id}
                className={cn(
                  "flex cursor-pointer flex-col gap-2 rounded-xl border bg-surface-editor p-4 transition-colors peer-focus-visible:ring-3 peer-focus-visible:ring-ring/50",
                  selected ? "border-brand/60 bg-brand-subtle/40" : "hover:border-text-muted/60",
                )}
              >
                <span className="flex w-full items-center justify-between text-xs font-medium text-text-secondary">
                  {option.label}
                  <span
                    aria-hidden="true"
                    className={cn(
                      "size-3.5 rounded-full border-2",
                      selected ? "border-brand bg-brand" : "border-border",
                    )}
                  />
                </span>
                <span className={cn("text-lg leading-relaxed text-foreground", option.className)}>
                  {option.sample}
                </span>
              </Label>
            </div>
          );
        })}
      </div>
    </fieldset>
  );
}
