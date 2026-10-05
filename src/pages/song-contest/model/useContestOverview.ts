import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

import { currentTimetableIndex, nextTimetableBoundary } from "./timetable";

export type ContestOverviewTab = "timetable" | "votes";

export const useContestOverview = (
  tab: ContestOverviewTab,
  onTabChange: (tab: ContestOverviewTab) => void,
) => {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const scrollContentRef = useRef<HTMLDivElement>(null);
  const timetableItemRefs = useRef<(HTMLLIElement | null)[]>([]);
  const [isScrollable, setIsScrollable] = useState(true);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [nowMs, setNowMs] = useState(() => Date.now());
  const currentIndex = currentTimetableIndex(nowMs);

  useEffect(() => {
    const nextAt = nextTimetableBoundary(nowMs);
    if (nextAt === undefined) return;

    const delay = Math.min(Math.max(nextAt - Date.now(), 0), 2_147_483_647);
    const timer = window.setTimeout(() => setNowMs(Date.now()), delay);

    return () => window.clearTimeout(timer);
  }, [nowMs]);

  useEffect(() => {
    const syncTime = () => setNowMs(Date.now());
    window.addEventListener("focus", syncTime);
    document.addEventListener("visibilitychange", syncTime);

    return () => {
      window.removeEventListener("focus", syncTime);
      document.removeEventListener("visibilitychange", syncTime);
    };
  }, []);

  const updateScrollState = useCallback(() => {
    const scrollArea = scrollAreaRef.current;
    if (!scrollArea) return;

    const scrollableDistance = scrollArea.scrollHeight - scrollArea.clientHeight;
    setIsScrollable(scrollableDistance > 4);
    setScrollProgress(
      scrollableDistance > 0
        ? Math.min(Math.max(scrollArea.scrollTop / scrollableDistance, 0), 1)
        : 0,
    );
  }, []);

  useLayoutEffect(() => {
    updateScrollState();

    const scrollContent = scrollContentRef.current;
    if (!scrollContent || typeof ResizeObserver === "undefined") return;

    const resizeObserver = new ResizeObserver(updateScrollState);
    resizeObserver.observe(scrollContent);

    return () => resizeObserver.disconnect();
  }, [tab, updateScrollState]);

  useLayoutEffect(() => {
    if (tab !== "timetable" || currentIndex === null || currentIndex === 0) return;

    const scrollArea = scrollAreaRef.current;
    const currentItem = timetableItemRefs.current[currentIndex];
    if (!scrollArea || !currentItem) return;

    const areaRect = scrollArea.getBoundingClientRect();
    const itemRect = currentItem.getBoundingClientRect();
    const centeredTop = Math.round(
      scrollArea.scrollTop +
        itemRect.top -
        areaRect.top +
        itemRect.height / 2 -
        scrollArea.clientHeight / 2,
    );
    const maxScrollTop = Math.max(0, scrollArea.scrollHeight - scrollArea.clientHeight);
    const top = Math.min(Math.max(centeredTop, 0), maxScrollTop);

    if (Math.abs(top - scrollArea.scrollTop) >= 1) {
      scrollArea.scrollTo({ top, behavior: "smooth" });
    }
  }, [currentIndex, tab]);

  const handleTabChange = (nextTab: ContestOverviewTab) => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = 0;
    }
    setScrollProgress(0);
    onTabChange(nextTab);
  };

  return {
    scrollAreaRef,
    scrollContentRef,
    timetableItemRefs,
    isScrollable,
    scrollProgress,
    currentIndex,
    updateScrollState,
    handleTabChange,
  };
};
