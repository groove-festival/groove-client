import { useEffect, useRef, useState } from "react";

import type { PlaylistPhase } from "@/entities/festival";

import { PLAYLIST_BOTTOM_ANCHOR_ID } from "./playlistAnchors";

const SCROLL_SETTLE_DELAY_MS = 180;
const SCROLL_FALLBACK_DELAY_MS = 1_000;
// 히어로 화살표의 스크롤이 끝난 뒤 신청 안내를 연다.
export function usePlaylistGuideScroll(phase: PlaylistPhase | undefined) {
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const isGuideScrollPendingRef = useRef(false);
  const cancelScrollWaitRef = useRef<(() => void) | null>(null);

  const cancelScrollWait = () => {
    cancelScrollWaitRef.current?.();
    cancelScrollWaitRef.current = null;
    isGuideScrollPendingRef.current = false;
  };

  const finishGuideScroll = () => {
    isGuideScrollPendingRef.current = false;
    setIsGuideOpen(true);
  };

  const handleBottomArrowClick = () => {
    cancelScrollWait();

    const target = document.getElementById(PLAYLIST_BOTTOM_ANCHOR_ID);
    if (!target) {
      return;
    }

    const shouldOpenGuide = phase === "SUBMISSION";
    const prefersReducedMotion =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    isGuideScrollPendingRef.current = shouldOpenGuide;

    if (!shouldOpenGuide || prefersReducedMotion) {
      target.scrollIntoView({
        behavior: prefersReducedMotion ? "auto" : "smooth",
        block: "start",
      });
      if (shouldOpenGuide) {
        finishGuideScroll();
      }
      return;
    }

    let isComplete = false;
    let cleanup = () => {};
    const finishOnce = () => {
      if (isComplete) {
        return;
      }

      isComplete = true;
      cleanup();
      cancelScrollWaitRef.current = null;
      finishGuideScroll();
    };
    let settleTimer: number | undefined;
    const scheduleScrollSettled = () => {
      window.clearTimeout(settleTimer);
      settleTimer = window.setTimeout(finishOnce, SCROLL_SETTLE_DELAY_MS);
    };
    const handleScroll = () => scheduleScrollSettled();
    const handleScrollEnd = () => finishOnce();
    const fallbackTimer = window.setTimeout(finishOnce, SCROLL_FALLBACK_DELAY_MS);

    cleanup = () => {
      window.clearTimeout(settleTimer);
      window.clearTimeout(fallbackTimer);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("scrollend", handleScrollEnd);
    };
    cancelScrollWaitRef.current = () => {
      if (isComplete) {
        return;
      }

      isComplete = true;
      cleanup();
      isGuideScrollPendingRef.current = false;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("scrollend", handleScrollEnd, { once: true });
    target.scrollIntoView({ behavior: "smooth", block: "start" });
    scheduleScrollSettled();
  };

  const handleGuideSectionEnter = () => {
    if (!isGuideScrollPendingRef.current) {
      setIsGuideOpen(true);
    }
  };

  useEffect(() => {
    return () => {
      cancelScrollWaitRef.current?.();
      cancelScrollWaitRef.current = null;
      isGuideScrollPendingRef.current = false;
    };
  }, []);

  return {
    isGuideOpen,
    closeGuide: () => setIsGuideOpen(false),
    handleBottomArrowClick,
    handleGuideSectionEnter,
  };
}
