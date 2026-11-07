"use client";

interface TitleInputProps {
  value: string;
  onChange: (value: string) => void;
}

/** The song title, editable in place and styled as the page heading. */
export function TitleInput({ value, onChange }: TitleInputProps) {
  return (
    <input
      value={value}
      onChange={(event) => onChange(event.target.value)}
      onBlur={() => {
        if (!value.trim()) onChange("Untitled");
      }}
      placeholder="Untitled"
      aria-label="Song title"
      maxLength={120}
      className="w-full rounded-md bg-transparent px-1 py-0.5 text-[28px] leading-tight font-semibold tracking-tight text-foreground outline-none placeholder:text-text-muted/60 focus-visible:bg-background/40 md:text-[32px]"
    />
  );
}
