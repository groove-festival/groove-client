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

const inactiveDotTone = "border-[#a2a2a2] bg-[#1c1c1c]";

const activeTextTone = "text-[#fcfcfc]";
const inactiveTextTone = "text-[#a2a2a2]";

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
