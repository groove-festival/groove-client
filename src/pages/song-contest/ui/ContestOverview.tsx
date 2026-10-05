import { type ReactNode } from "react";

import { timetable } from "../model/timetable";
import {
  useContestOverview,
  type ContestOverviewTab,
} from "../model/useContestOverview";

interface ContestOverviewProps {
  tab: ContestOverviewTab;
  onTabChange: (tab: ContestOverviewTab) => void;
  votesTabLabel: string;
  votesTabContent: ReactNode;
}

export const ContestOverview = ({
  tab,
  onTabChange,
  votesTabLabel,
  votesTabContent,
}: ContestOverviewProps) => {
  const {
    scrollAreaRef,
    scrollContentRef,
    timetableItemRefs,
    isScrollable,
    scrollProgress,
    currentIndex,
    updateScrollState,
    handleTabChange,
  } = useContestOverview(tab, onTabChange);
  return (
    <section
      aria-label="가요제 일정과 경연"
      className="mx-auto mt-[100px] h-[392px] w-full rounded-3xl border border-[#565656] bg-[rgba(252,252,252,0.1)] px-3 pt-4 pb-5"
    >
      <div aria-label="가요제 보기" className="flex h-[43px] gap-3" role="tablist">
        {(["timetable", "votes"] as const).map((item) => (
          <button
            aria-controls="contest-panel"
            aria-selected={tab === item}
            className={`min-w-0 flex-1 rounded-full text-base font-semibold ${tab === item ? "bg-[rgba(255,0,128,0.8)] text-[#fcfcfc]" : "text-[#a2a2a2]"}`}
            key={item}
            onClick={() => handleTabChange(item)}
            role="tab"
            type="button"
          >
            {item === "timetable" ? "타임테이블" : votesTabLabel}
          </button>
        ))}
      </div>
      <div className="relative mt-5 h-[292px]">
        <div
          aria-label={tab === "timetable" ? "가요제 타임테이블" : votesTabLabel}
          className="h-full touch-pan-y [scrollbar-width:none] overflow-y-auto overscroll-contain [&::-webkit-scrollbar]:hidden"
          id="contest-panel"
          onScroll={updateScrollState}
          ref={scrollAreaRef}
          role="tabpanel"
        >
          <div className="pr-3" ref={scrollContentRef}>
            {tab === "timetable" ? (
              <ol className="relative ml-3 space-y-3 pl-[22px]">
                {timetable.map((item, index) => (
                  <li
                    className="relative"
                    key={`${item.time}-${item.title}`}
                    ref={(element) => {
                      timetableItemRefs.current[index] = element;
                    }}
                  >
                    {index < timetable.length - 1 && (
                      <span
                        aria-hidden="true"
                        className="absolute top-[21px] -left-[23px] h-[calc(100%+12px)] w-px bg-[#a2a2a2]"
                      />
                    )}
                    <span
                      className={`absolute top-[21px] -left-[31px] size-4 rounded-full border border-[#fcfcfc] ${index === currentIndex ? "bg-[#ff0080]" : "bg-[#767676]"}`}
                    />
                    <div
                      className={`flex min-h-[61px] items-center justify-between gap-2 rounded-2xl border p-4 ${index === currentIndex ? "border-[#ff0080] bg-[rgba(255,0,128,0.8)]" : "border-[#fcfcfc] bg-[#767676] text-[#cfcfcf]"}`}
                    >
                      <span className="text-sm font-semibold">{item.title}</span>
                      <time className="shrink-0 text-sm font-semibold">
                        {item.time}
                      </time>
                    </div>
                  </li>
                ))}
              </ol>
            ) : (
              votesTabContent
            )}
          </div>
        </div>

        {isScrollable && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute top-1 right-0 bottom-1 w-1 rounded-full bg-[#fcfcfc]/10"
          >
            <span
              className="block h-[60px] w-1 rounded-full bg-[#fcfcfc]/70"
              data-testid="contest-scroll-thumb"
              style={{ transform: `translateY(${scrollProgress * 224}px)` }}
            />
          </div>
        )}
      </div>
    </section>
  );
};
