import { describe, expect, it } from "vitest";
import { insertAfter, moveItem, normalizePositions, removeAt } from "./ordering";

const items = (...ids: string[]) => ids.map((id, position) => ({ id, position }));

describe("ordering helpers", () => {
  it("normalizePositions sorts and renumbers without gaps", () => {
    const messy = [{ id: "c", position: 7 }, { id: "a", position: 0 }, { id: "b", position: 3 }];
    expect(normalizePositions(messy)).toEqual(items("a", "b", "c"));
  });

  it("moveItem moves forward and backward and renumbers", () => {
    expect(moveItem(items("a", "b", "c"), 0, 2).map((i) => i.id)).toEqual(["b", "c", "a"]);
    expect(moveItem(items("a", "b", "c"), 2, 0).map((i) => i.id)).toEqual(["c", "a", "b"]);
    expect(moveItem(items("a", "b", "c"), 1, 1).map((i) => i.position)).toEqual([0, 1, 2]);
  });

  it("moveItem ignores out-of-range indexes", () => {
    expect(moveItem(items("a", "b"), 0, 5)).toEqual(items("a", "b"));
    expect(moveItem(items("a", "b"), -1, 0)).toEqual(items("a", "b"));
  });

  it("insertAfter and removeAt keep positions contiguous", () => {
    const inserted = insertAfter(items("a", "c"), 0, { id: "b", position: 99 });
    expect(inserted).toEqual(items("a", "b", "c"));
    expect(removeAt(inserted, 1)).toEqual(items("a", "c"));
  });
});
