import { moveByOffset, sortByDisplayOrder } from "./displayOrder";

const song = (id: number, displayOrder: number | undefined, requestedAt: string) => ({
  songRequestId: id,
  displayOrder,
  requestedAt,
});

describe("sortByDisplayOrder", () => {
  it("orders songs with a displayOrder first, by that value", () => {
    const result = sortByDisplayOrder([
      song(1, 3, "2026-09-12T10:00:00+09:00"),
      song(2, 1, "2026-09-12T11:00:00+09:00"),
      song(3, 2, "2026-09-12T09:00:00+09:00"),
    ]);

    expect(result.map((s) => s.songRequestId)).toEqual([2, 3, 1]);
  });

  it("puts songs without a displayOrder after ordered ones, by requestedAt", () => {
    const result = sortByDisplayOrder([
      song(1, undefined, "2026-09-12T12:00:00+09:00"),
      song(2, 1, "2026-09-12T11:00:00+09:00"),
      song(3, undefined, "2026-09-12T08:00:00+09:00"),
    ]);

    expect(result.map((s) => s.songRequestId)).toEqual([2, 3, 1]);
  });

  it("does not mutate the input", () => {
    const input = [song(1, 2, "a"), song(2, 1, "b")];
    sortByDisplayOrder(input);
    expect(input.map((s) => s.songRequestId)).toEqual([1, 2]);
  });
});

describe("moveByOffset", () => {
  it("moves an item up", () => {
    expect(moveByOffset([10, 20, 30], 2, -1)).toEqual([10, 30, 20]);
  });

  it("moves an item down", () => {
    expect(moveByOffset([10, 20, 30], 0, 1)).toEqual([20, 10, 30]);
  });

  it("returns a copy unchanged when the move goes out of range", () => {
    const input = [10, 20, 30];
    const result = moveByOffset(input, 0, -1);
    expect(result).toEqual([10, 20, 30]);
    expect(result).not.toBe(input);
  });
});
