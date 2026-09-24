import { useNow } from "@/shared/lib/clock";

import {
  festivalTimetable,
  formatTimetableTime,
  getTimetableDateKey,
  isTimetableItemActive,
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
  const now = useNow(30_000);
  const dateKey = getTimetableDateKey(now);
  const items = festivalTimetable[dateKey];

  return (
    <ol aria-label={`${dateKey} 일정`} className="flex w-full flex-col gap-4">
      {items.map((item, index) => {
        const isActive = isTimetableItemActive(item, dateKey, now);
        const tone = timetableCategoryTones[item.category];
        const cardTone = isActive ? tone.active : tone.default;
        const dotTone = isActive ? tone.active : inactiveDotTone;
        const textTone = isActive ? activeTextTone : inactiveTextTone;
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
            <div
              className={`festival-glass-border-rim relative flex min-h-20 min-w-0 flex-1 items-start justify-between gap-3 rounded-2xl border pt-[17px] pr-[18px] pb-[17px] pl-[19px] text-left leading-[normal] backdrop-blur-[12px] ${textTone} ${cardTone}`}
            >
              <span className="block w-[147px] max-w-full text-base leading-[normal] font-bold break-keep">
                {item.title}
              </span>
              <span className="block shrink-0 text-right text-base leading-[normal] font-bold">
                {formatTimetableTime(item)}
              </span>
            </div>
          </li>
        );
      })}
    </ol>
  );
};
