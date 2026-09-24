import { useState } from "react";
import { useSearchParams } from "react-router";

import { useNow } from "@/shared/lib/clock";

import {
  festivalTimetable,
  formatTimetableTime,
  getTimetableDateKey,
  isTimetableItemActive,
  parseTimetableNowOverride,
  type TimetableCategory,
} from "../model/timetable";

interface TimetableCategoryTone {
  default: string;
  active: string;
}

// 카테고리 색 (Figma 31:3167). 진행 중이면 색 80% + 같은 색 1px 테두리, 아니면
// 색 20% + 테두리 30%. 글자는 모두 #fcfcfc. Figma GLASS(흐림 24)는
// backdrop-blur와 테두리 위에 겹친 반사광(festival-glass-border-rim)으로
// 근사한다. 진행 중인 항목의 점도 같은 active 색을 쓴다.
// 카테고리별 색은 이 맵에서만 정한다. 데이터는 category 필드만 가진다.
const timetableCategoryTones: Record<TimetableCategory, TimetableCategoryTone> = {
  contest: {
    default: "border-magenta/30 bg-magenta/20",
    active: "border-magenta bg-magenta/80",
  },
  program: {
    default: "border-cyan/30 bg-cyan/20",
    active: "border-cyan bg-cyan/80",
  },
  operation: {
    default: "border-lime/30 bg-lime/20",
    active: "border-lime bg-lime/80",
  },
};

// Figma 25:2147(점). 진행 중이 아니면 어두운 원.
const inactiveDotTone = "border-[#a2a2a2] bg-[#1c1c1c]";

// Figma 변수 White/900 · White/600. 진행 중이 아닌 카드는 글자 명도를 낮춰
// 현재 시간대 카드와 위계를 만든다.
const activeTextTone = "text-[#fcfcfc]";
const inactiveTextTone = "text-[#a2a2a2]";

// Figma 25:2152(카드). 카드는 제목과 시간만 보여 준다. 제목 폭은 Figma
// 컴포넌트처럼 147px이고, 두 줄까지는 80px, 세 줄부터 카드 높이가 늘어난다.
export const TimetableSection = () => {
  const [searchParams] = useSearchParams();
  const currentTime = useNow(30_000);
  // 시각 덮어쓰기는 개발 서버에서만 허용한다.
  const nowOverride = import.meta.env.DEV
    ? parseTimetableNowOverride(searchParams.get("now"))
    : null;
  const now = nowOverride ?? currentTime;
  const dateKey = getTimetableDateKey(now);
  const items = festivalTimetable[dateKey];
  // 임시(디자인 QA용): 카드를 누를 때마다 활성/비활성 색을 켜고 끈다. 처음에는
  // 실제 시간 기준이고, 누른 카드만 덮어쓴다. 현재 시간대 판정(aria-current)은
  // 그대로다. 일정 API 연동 때 이 상태와 버튼을 걷어낸다.
  const [toneOverrides, setToneOverrides] = useState<Record<string, boolean>>({});

  return (
    <ol aria-label={`${dateKey} 일정`} className="flex w-full flex-col gap-4">
      {items.map((item, index) => {
        const isActive = isTimetableItemActive(item, dateKey, now);
        const showActiveTone = toneOverrides[item.id] ?? isActive;
        const tone = timetableCategoryTones[item.category];
        const cardTone = showActiveTone ? tone.active : tone.default;
        const dotTone = showActiveTone ? tone.active : inactiveDotTone;
        const textTone = showActiveTone ? activeTextTone : inactiveTextTone;
        const isLast = index === items.length - 1;

        return (
          <li
            aria-current={isActive ? "time" : undefined}
            className="relative flex w-full items-start justify-between gap-[21px]"
            data-category={item.category}
            key={item.id}
          >
            {!isLast && (
              <span
                aria-hidden="true"
                className="absolute top-[15px] left-[7.5px] h-[calc(100%+2px)] w-px bg-[#a2a2a2]"
              />
            )}
            <span
              aria-hidden="true"
              className={`relative size-4 shrink-0 rounded-full border ${dotTone}`}
            />
            <button
              aria-pressed={showActiveTone}
              className={`festival-glass-border-rim relative flex min-h-20 min-w-0 flex-1 cursor-pointer items-start justify-between gap-3 rounded-2xl border pt-[17px] pr-[18px] pb-[17px] pl-[19px] text-left leading-[normal] backdrop-blur-[12px] ${textTone} ${cardTone}`}
              onClick={() =>
                setToneOverrides((previous) => ({
                  ...previous,
                  [item.id]: !showActiveTone,
                }))
              }
              type="button"
            >
              <span className="block w-[147px] max-w-full text-base leading-[normal] font-bold break-keep">
                {item.title}
              </span>
              <span className="block shrink-0 text-right text-base leading-[normal] font-bold">
                {formatTimetableTime(item)}
              </span>
            </button>
          </li>
        );
      })}
    </ol>
  );
};
