"use client";

import { useEffect } from "react";
import type { LyricFont } from "@/lib/domain/types";

/**
 * Applies the signed-in user's lyric font preference to <html>, where the
 * `.lyric-text` rule reads it. The root layout cannot know the user (it is
 * static), so this runs once the account section has streamed in.
 */
export function LyricFontSync({ font }: { font: LyricFont }) {
  useEffect(() => {
    document.documentElement.dataset.lyricFont = font;
  }, [font]);
  return null;
}
