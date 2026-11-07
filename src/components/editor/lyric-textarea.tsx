"use client";

import { useLayoutEffect, useRef, type ComponentProps } from "react";
import { cn } from "@/lib/utils";

interface LyricTextareaProps extends Omit<ComponentProps<"textarea">, "value" | "onChange"> {
  value: string;
  onChange: (value: string) => void;
  autoFocusOnMount?: boolean;
}

/**
 * A plain textarea with auto-growing height. A rich-text framework would add
 * weight without helping lyrics, which are line-oriented plain text. Line
 * breaks are preserved exactly as typed.
 */
export function LyricTextarea({
  value,
  onChange,
  className,
  autoFocusOnMount,
  ...props
}: LyricTextareaProps) {
  const ref = useRef<HTMLTextAreaElement>(null);

  // Resize to fit content before paint so the layout never jumps.
  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;
    element.style.height = "0px";
    element.style.height = `${element.scrollHeight}px`;
  }, [value]);

  useLayoutEffect(() => {
    if (autoFocusOnMount) {
      const element = ref.current;
      element?.focus();
      element?.setSelectionRange(element.value.length, element.value.length);
    }
  }, [autoFocusOnMount]);

  return (
    <textarea
      ref={ref}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      rows={2}
      spellCheck
      className={cn(
        "lyric-text block w-full resize-none overflow-hidden rounded-md bg-transparent px-1 py-0.5 text-foreground outline-none placeholder:text-text-muted/70 focus-visible:bg-background/40",
        className,
      )}
      {...props}
    />
  );
}
