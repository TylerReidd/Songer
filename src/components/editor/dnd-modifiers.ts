import type { Modifier } from "@dnd-kit/core";

/**
 * Locks drag movement to the vertical axis. Inlined rather than pulling in
 * @dnd-kit/modifiers for a single two-line function.
 */
export const restrictToVerticalAxis: Modifier = ({ transform }) => ({
  ...transform,
  x: 0,
});
