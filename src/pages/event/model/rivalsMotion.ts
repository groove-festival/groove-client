import { type RefObject, useEffect, useLayoutEffect, useRef, useState } from "react";

import type { College, RivalScore } from "./rivals";

// 순위가 바뀐 단대가 옛 자리에서 새 자리로 미끄러지는 시간.
const RANK_MOVE_MS = 1000;
// 처음과 끝을 모두 느리게 해 출발과 도착이 튀지 않게 한다.
const RANK_MOVE_EASING = "cubic-bezier(0.65, 0, 0.35, 1)";
// 단상 ↔ 목록을 오가는 단대는 멀리 날리지 않고 새 자리에서 이만큼 아래서 떠오른다.
const RANK_ENTER_OFFSET_PX = 8;
// 점수가 옛 값에서 새 값으로 올라가는 시간.
const COUNT_UP_MS = 1200;

// 순위가 움직이는 항목에 붙이는 속성. 값은 단대 코드다.
const RANK_ITEM_ATTRIBUTE = "data-rank-item";

const prefersReducedMotion = () =>
  typeof window.matchMedia === "function" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// 직전 응답보다 앞 순서로 올라온 단대. 동점이면 등수 값이 같을 수 있어
// 등수가 아니라 응답 순서로 비교한다. 처음 보는 단대는 오른 것으로 치지 않는다.
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

// 점수 올라가는 중간값. 끝으로 갈수록 느려지게 해 마지막 숫자가 읽히게 한다.
export const getCountUpValue = (from: number, to: number, progress: number) => {
  const eased = 1 - (1 - Math.min(Math.max(progress, 0), 1)) ** 3;
  return Math.round(from + (to - from) * eased);
};

const toScoreMap = (scores: readonly RivalScore[]) =>
  new Map(scores.map(({ college, score }) => [college, score]));

// 폴링으로 점수가 바뀌면 화면의 점수를 옛 값에서 새 값까지 올린다.
// 단대가 단상과 목록 사이를 옮겨 다시 그려져도 이어지도록 섹션 전체에서 한 번에 센다.
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

// 다시 그려진 항목인지 가리려고 요소도 함께 기억한다.
type ItemCenters = Map<string, { x: number; y: number; element: HTMLElement }>;

// 컨테이너 기준 항목 중심. 페이지를 스크롤해도 값이 변하지 않게 컨테이너 기준으로 잰다.
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

// 순위가 바뀌면 같은 영역(단상 안, 목록 안)에서 움직인 단대는 옛 자리에서 새 자리로
// 미끄러뜨린다(FLIP). 새 순서로 그린 뒤 옛 자리만큼 되돌려 놓고 제자리로 풀어 준다.
// 단상 ↔ 목록을 오간 단대는 요소가 새로 그려지는데, 화면 반을 가로질러 날리면
// 요란해서 새 자리에서 살짝 떠오르며 나타나게만 한다.
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

  // 화면 폭이 바뀌면 자리도 바뀌므로 다음 비교의 기준을 새로 잰다.
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
