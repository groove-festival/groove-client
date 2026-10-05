import { type RefObject, useEffect, useLayoutEffect, useRef, useState } from "react";

import type { College, RivalScore } from "./rivals";

const RANK_MOVE_MS = 1000;

const RANK_MOVE_EASING = "cubic-bezier(0.65, 0, 0.35, 1)";

const RANK_ENTER_OFFSET_PX = 8;

const COUNT_UP_MS = 1200;

const RANK_ITEM_ATTRIBUTE = "data-rank-item";

const prefersReducedMotion = () =>
  typeof window.matchMedia === "function" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export const getRisenColleges = (
  previous: readonly RivalScore[],
  next: readonly RivalScore[],
): Set<College> => {
  const previousIndex = new Map(previous.map(({ college }, index) => [college, index]));

  return new Set(
    next
      .filter(({ college }, index) => {
        const before = previousIndex.get(college);
        return before !== undefined && index < before;
      })
      .map(({ college }) => college),
  );
};

export const getCountUpValue = (from: number, to: number, progress: number) => {
  const eased = 1 - (1 - Math.min(Math.max(progress, 0), 1)) ** 3;
  return Math.round(from + (to - from) * eased);
};

const toScoreMap = (scores: readonly RivalScore[]) =>
  new Map(scores.map(({ college, score }) => [college, score]));

export const useCountUpScores = (scores: readonly RivalScore[]) => {
  const [shown, setShown] = useState(() => toScoreMap(scores));
  const shownRef = useRef(shown);
  const reduced = prefersReducedMotion();

  useEffect(() => {
    if (reduced) return;

    const from = shownRef.current;
    const target = toScoreMap(scores);
    if ([...target].every(([college, score]) => from.get(college) === score)) return;

    let frame = 0;
    let start: number | null = null;
    const tick = (now: number) => {
      start ??= now;
      const progress = (now - start) / COUNT_UP_MS;
      const next = new Map(
        [...target].map(([college, score]) => [
          college,
          getCountUpValue(from.get(college) ?? score, score, progress),
        ]),
      );
      shownRef.current = next;
      setShown(next);
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(frame);
  }, [reduced, scores]);

  return (college: College, score: number) =>
    reduced ? score : (shown.get(college) ?? score);
};

type ItemCenters = Map<string, { x: number; y: number; element: HTMLElement }>;

const measureItems = (container: HTMLElement): ItemCenters => {
  const origin = container.getBoundingClientRect();

  return new Map(
    Array.from(
      container.querySelectorAll<HTMLElement>(`[${RANK_ITEM_ATTRIBUTE}]`),
      (item) => {
        const rect = item.getBoundingClientRect();
        return [
          item.getAttribute(RANK_ITEM_ATTRIBUTE) ?? "",
          {
            x: rect.left - origin.left + rect.width / 2,
            y: rect.top - origin.top + rect.height / 2,
            element: item,
          },
        ] as const;
      },
    ),
  );
};

export const useRankFlip = (
  containerRef: RefObject<HTMLElement | null>,
  scores: readonly RivalScore[],
) => {
  const centers = useRef<ItemCenters>(new Map());

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const next = measureItems(container);
    if (!prefersReducedMotion()) {
      container
        .querySelectorAll<HTMLElement>(`[${RANK_ITEM_ATTRIBUTE}]`)
        .forEach((item) => {
          const key = item.getAttribute(RANK_ITEM_ATTRIBUTE) ?? "";
          const before = centers.current.get(key);
          const after = next.get(key);
          if (!before || !after || typeof item.animate !== "function") return;

          if (before.element !== item) {
            item.animate(
              [
                { opacity: 0, transform: `translateY(${RANK_ENTER_OFFSET_PX}px)` },
                { opacity: 1, transform: "translateY(0)" },
              ],
              { duration: RANK_MOVE_MS, easing: RANK_MOVE_EASING },
            );
            return;
          }

          const dx = before.x - after.x;
          const dy = before.y - after.y;
          if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) return;

          item.animate(
            [
              { transform: `translate(${dx}px, ${dy}px)` },
              { transform: "translate(0, 0)" },
            ],
            { duration: RANK_MOVE_MS, easing: RANK_MOVE_EASING },
          );
        });
    }
    centers.current = next;
  }, [containerRef, scores]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || typeof ResizeObserver === "undefined") return;

    const observer = new ResizeObserver(() => {
      centers.current = measureItems(container);
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, [containerRef]);
};
