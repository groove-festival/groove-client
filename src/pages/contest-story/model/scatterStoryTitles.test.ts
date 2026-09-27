import { scatterStoryTitles, type StoryTitleSize } from "./scatterStoryTitles";

const titles: StoryTitleSize[] = [
  { width: 140, height: 25, seed: 11 },
  { width: 225, height: 31, seed: 22 },
  { width: 95, height: 20, seed: 33 },
  { width: 170, height: 29, seed: 44 },
  { width: 280, height: 33, seed: 55 },
  { width: 110, height: 24, seed: 66 },
  { width: 195, height: 30, seed: 77 },
  { width: 155, height: 28, seed: 88 },
  { width: 240, height: 32, seed: 99 },
  { width: 120, height: 25, seed: 110 },
  { width: 180, height: 29, seed: 121 },
  { width: 205, height: 30, seed: 132 },
];

describe("scatterStoryTitles", () => {
  it.each([288, 361, 568])(
    "keeps varied titles inside a %ipx area without collisions",
    (width) => {
      const layout = scatterStoryTitles(titles, width);

      expect(layout.placements).toHaveLength(titles.length);
      expect(layout.height).toBeGreaterThanOrEqual(336);
      for (const [index, item] of layout.placements.entries()) {
        expect(item.left).toBeGreaterThanOrEqual(0);
        expect(item.top).toBeGreaterThanOrEqual(0);
        expect(item.left + item.width).toBeLessThanOrEqual(width);
        expect(item.top + item.height).toBeLessThanOrEqual(layout.height);

        for (const other of layout.placements.slice(index + 1)) {
          const intersects =
            item.left < other.left + other.width &&
            item.left + item.width > other.left &&
            item.top < other.top + other.height &&
            item.top + item.height > other.top;
          expect(intersects).toBe(false);
        }
      }

      expect(layout.placements.map(({ top }) => top)).not.toEqual(
        [...layout.placements.map(({ top }) => top)].sort((a, b) => a - b),
      );
    },
  );

  it("returns the same arrangement for unchanged data and an empty area for no titles", () => {
    expect(scatterStoryTitles(titles, 361)).toEqual(scatterStoryTitles(titles, 361));
    expect(scatterStoryTitles([], 361)).toEqual({ placements: [], height: 336 });
  });
});
