/**
 * Pure helpers for ordered song sections. They never touch React or the
 * database, which makes them trivial to unit test and safe to share between
 * the editor (client) and the persistence layer (server).
 */

interface Positioned {
  position: number;
}

/** Returns a copy sorted by position with positions rewritten to 0..n-1. */
export function normalizePositions<T extends Positioned>(items: readonly T[]): T[] {
  return [...items]
    .sort((a, b) => a.position - b.position)
    .map((item, index) => (item.position === index ? item : { ...item, position: index }));
}

/** Moves the item at `from` to `to` and renumbers. Out-of-range indexes are a no-op. */
export function moveItem<T extends Positioned>(items: readonly T[], from: number, to: number): T[] {
  if (from === to || from < 0 || to < 0 || from >= items.length || to >= items.length) {
    return [...items];
  }
  const next = [...items];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next.map((item, index) => ({ ...item, position: index }));
}

/** Inserts `item` directly after index `afterIndex` and renumbers. */
export function insertAfter<T extends Positioned>(
  items: readonly T[],
  afterIndex: number,
  item: T,
): T[] {
  const next = [...items];
  next.splice(afterIndex + 1, 0, item);
  return next.map((entry, index) => ({ ...entry, position: index }));
}

export function removeAt<T extends Positioned>(items: readonly T[], index: number): T[] {
  return items
    .filter((_, i) => i !== index)
    .map((entry, position) => ({ ...entry, position }));
}
