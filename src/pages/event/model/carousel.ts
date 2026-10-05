export interface CarouselItemBox {
  left: number;
  width: number;
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

export const getCenteredScrollLeft = (
  item: CarouselItemBox,
  viewportWidth: number,
  maxScrollLeft: number,
): number =>
  clamp(item.left - (viewportWidth - item.width) / 2, 0, Math.max(maxScrollLeft, 0));

export const getScrollProgress = (scrollLeft: number, maxScrollLeft: number): number =>
  maxScrollLeft > 0 ? clamp(scrollLeft / maxScrollLeft, 0, 1) : 0;

export const easeInOutCubic = (t: number): number =>
  t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2;

export const getAnimatedScrollLeft = (
  from: number,
  to: number,
  elapsedMs: number,
  durationMs: number,
): number => {
  const progress = durationMs > 0 ? clamp(elapsedMs / durationMs, 0, 1) : 1;
  return from + (to - from) * easeInOutCubic(progress);
};
