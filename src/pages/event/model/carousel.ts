export interface CarouselItemBox {
  // 스크롤 영역 안에서의 왼쪽 위치와 너비.
  left: number;
  width: number;
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

// 항목을 가운데에 두는 scrollLeft. 양 끝 항목은 스크롤 범위 안에서 멈춘다.
export const getCenteredScrollLeft = (
  item: CarouselItemBox,
  viewportWidth: number,
  maxScrollLeft: number,
): number =>
  clamp(item.left - (viewportWidth - item.width) / 2, 0, Math.max(maxScrollLeft, 0));

// 0(처음)부터 1(끝)까지의 가로 스크롤 진행률.
export const getScrollProgress = (scrollLeft: number, maxScrollLeft: number): number =>
  maxScrollLeft > 0 ? clamp(scrollLeft / maxScrollLeft, 0, 1) : 0;

// 앞뒤가 모두 완만한 이징. 짧은 거리도 툭 끊기지 않고 미끄러지듯 멈춘다.
export const easeInOutCubic = (t: number): number =>
  t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2;

// 애니메이션 경과 시간에 따른 scrollLeft.
export const getAnimatedScrollLeft = (
  from: number,
  to: number,
  elapsedMs: number,
  durationMs: number,
): number => {
  const progress = durationMs > 0 ? clamp(elapsedMs / durationMs, 0, 1) : 1;
  return from + (to - from) * easeInOutCubic(progress);
};
