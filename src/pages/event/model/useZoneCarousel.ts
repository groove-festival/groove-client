import { useCallback, useEffect, useRef, useState } from "react";

import {
  type CarouselItemBox,
  getAnimatedScrollLeft,
  getCenteredScrollLeft,
  getScrollProgress,
} from "./carousel";

// 선택한 카드로 미끄러지는 시간. 브라우저 기본 smooth보다 길고 부드럽게 맞춘다.
export const CAROUSEL_SLIDE_DURATION_MS = 520;

// 사용자가 직접 넘기기 시작하면 진행 중인 자동 이동을 멈춘다.
const USER_SCROLL_EVENTS = ["pointerdown", "touchstart", "wheel"] as const;

interface ScrollMetrics {
  progress: number;
  // 전체 폭 중 보이는 폭의 비율. 슬라이드바 thumb 폭으로 쓴다.
  visibleRatio: number;
}

const readItemBoxes = (scroller: HTMLElement): CarouselItemBox[] =>
  Array.from(scroller.children, (child) => {
    const item = child as HTMLElement;
    return { left: item.offsetLeft, width: item.offsetWidth };
  });

const prefersReducedMotion = () =>
  typeof window.matchMedia === "function" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// 선택된 카드를 가운데로 부드럽게 옮기고, 슬라이드바용 스크롤 진행률을 알려준다.
// 선택은 카드·부스 탭으로만 바뀌고 스크롤·스와이프로는 바뀌지 않는다.
// 스크롤 영역은 offsetParent가 되도록 position을 지정해야 카드 위치를 읽을 수 있다.
export const useZoneCarousel = (selectedIndex: number) => {
  const scrollerRef = useRef<HTMLUListElement>(null);
  const cancelSlideRef = useRef<(() => void) | null>(null);
  const [scrollMetrics, setScrollMetrics] = useState<ScrollMetrics>({
    progress: 0,
    visibleRatio: 1,
  });

  const measure = useCallback(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    const { scrollLeft, scrollWidth, clientWidth } = scroller;
    setScrollMetrics({
      progress: getScrollProgress(scrollLeft, scrollWidth - clientWidth),
      visibleRatio: scrollWidth > 0 ? Math.min(clientWidth / scrollWidth, 1) : 1,
    });
  }, []);

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    const stopSlide = () => cancelSlideRef.current?.();

    measure();
    scroller.addEventListener("scroll", measure, { passive: true });
    USER_SCROLL_EVENTS.forEach((type) =>
      scroller.addEventListener(type, stopSlide, { passive: true }),
    );

    const resizeObserver =
      typeof ResizeObserver === "undefined" ? null : new ResizeObserver(measure);
    resizeObserver?.observe(scroller);

    return () => {
      stopSlide();
      scroller.removeEventListener("scroll", measure);
      USER_SCROLL_EVENTS.forEach((type) =>
        scroller.removeEventListener(type, stopSlide),
      );
      resizeObserver?.disconnect();
    };
  }, [measure]);

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller || selectedIndex < 0) return;

    const item = readItemBoxes(scroller)[selectedIndex];
    if (!item) return;

    const from = scroller.scrollLeft;
    const to = getCenteredScrollLeft(
      item,
      scroller.clientWidth,
      scroller.scrollWidth - scroller.clientWidth,
    );
    if (Math.abs(to - from) < 1) return;

    cancelSlideRef.current?.();
    if (prefersReducedMotion()) {
      scroller.scrollLeft = to;
      return;
    }

    let frame = 0;
    let startTime: number | null = null;

    const finish = () => {
      window.cancelAnimationFrame(frame);
      cancelSlideRef.current = null;
    };

    const step = (now: number) => {
      startTime ??= now;
      const elapsed = now - startTime;
      scroller.scrollLeft = getAnimatedScrollLeft(
        from,
        to,
        elapsed,
        CAROUSEL_SLIDE_DURATION_MS,
      );
      if (elapsed < CAROUSEL_SLIDE_DURATION_MS) {
        frame = window.requestAnimationFrame(step);
      } else {
        finish();
      }
    };

    cancelSlideRef.current = finish;
    frame = window.requestAnimationFrame(step);
  }, [selectedIndex]);

  return { scrollerRef, scrollMetrics };
};
