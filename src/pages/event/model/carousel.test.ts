import {
  easeInOutCubic,
  getAnimatedScrollLeft,
  getCenteredScrollLeft,
  getScrollProgress,
} from "./carousel";

// Figma 34:3578: 카드 204, 간격 12, 보이는 폭 361.
const cards = [0, 216, 432, 648, 864].map((left) => ({ left, width: 204 }));
const VIEWPORT = 361;
const MAX_SCROLL = 864 + 204 - VIEWPORT;

describe("getCenteredScrollLeft", () => {
  it("centers a middle card", () => {
    expect(getCenteredScrollLeft(cards[1], VIEWPORT, MAX_SCROLL)).toBe(137.5);
  });

  it("clamps the edge cards to the scroll range", () => {
    expect(getCenteredScrollLeft(cards[0], VIEWPORT, MAX_SCROLL)).toBe(0);
    expect(getCenteredScrollLeft(cards[4], VIEWPORT, MAX_SCROLL)).toBe(MAX_SCROLL);
  });
});

describe("getScrollProgress", () => {
  it("maps the scroll position to 0..1", () => {
    expect(getScrollProgress(0, MAX_SCROLL)).toBe(0);
    expect(getScrollProgress(MAX_SCROLL / 2, MAX_SCROLL)).toBe(0.5);
    expect(getScrollProgress(MAX_SCROLL + 10, MAX_SCROLL)).toBe(1);
  });

  it("stays at 0 when nothing can scroll", () => {
    expect(getScrollProgress(0, 0)).toBe(0);
  });
});

describe("getAnimatedScrollLeft", () => {
  it("starts and ends exactly at the endpoints", () => {
    expect(getAnimatedScrollLeft(0, 300, 0, 500)).toBe(0);
    expect(getAnimatedScrollLeft(0, 300, 500, 500)).toBe(300);
    expect(getAnimatedScrollLeft(0, 300, 800, 500)).toBe(300);
  });

  it("eases in and out around the midpoint", () => {
    expect(getAnimatedScrollLeft(0, 300, 250, 500)).toBe(150);
    expect(easeInOutCubic(0.1)).toBeLessThan(0.1);
    expect(easeInOutCubic(0.9)).toBeGreaterThan(0.9);
  });

  it("jumps to the target without a duration", () => {
    expect(getAnimatedScrollLeft(100, 0, 0, 0)).toBe(0);
  });
});
