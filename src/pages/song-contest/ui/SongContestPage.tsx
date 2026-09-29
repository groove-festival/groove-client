import {
  type ReactNode,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

import { useVotes } from "@/entities/contest";
import { useFestivalStatus } from "@/entities/festival";
import { useScheduledRefetch } from "@/shared/lib/scheduling";
import { LoadingFallback, NetworkErrorFallback } from "@/shared/ui";

import { nextContestBoundaryAt } from "../model/nextContestBoundaryAt";
import { formatRemainingMinutes } from "../model/remainingMinutes";
import {
  currentTimetableIndex,
  nextTimetableBoundary,
  timetable,
} from "../model/timetable";
import { BracketMatchRow } from "./BracketMatchRow";
import { ContestBeforeNotice } from "./ContestBeforeNotice";
import { ContestClosedNotice } from "./ContestClosedNotice";
import { ContestResults } from "./ContestResults";
import { VoteCastingPanel } from "./VoteCastingPanel";

type Tab = "timetable" | "votes";

function ContestOverview({
  tab,
  onTabChange,
  votesTabLabel,
  votesTabContent,
}: {
  tab: Tab;
  onTabChange: (tab: Tab) => void;
  votesTabLabel: string;
  votesTabContent: ReactNode;
}) {
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

  const handleTabChange = (nextTab: Tab) => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = 0;
    }
    setScrollProgress(0);
    onTabChange(nextTab);
  };

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
          <div ref={scrollContentRef}>
            {tab === "timetable" ? (
              <ol className="relative ml-3 space-y-3 pb-[146px] pl-[22px]">
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
}

export default function SongContestPage() {
  const status = useFestivalStatus();
  const contestPhase = status.data?.stage.contestPhase;
  const votesQuery = useVotes();
  const votes = votesQuery.data ?? [];
  const [tab, setTab] = useState<Tab>("timetable");

  useScheduledRefetch(
    status.data ? nextContestBoundaryAt(contestPhase, status.data.stage) : undefined,
    status.refetch,
  );

  if (!contestPhase && status.isPending) {
    return <LoadingFallback />;
  }

  if (!contestPhase && status.isError) {
    return <NetworkErrorFallback />;
  }

  // 경연 단계는 셋이다. 경연 시작 전(BEFORE)에도 대진표는 참가팀이 정해져 있어
  // 미리 보여주고, 투표 영역만 "경연 당일에 열려요" 안내로 막는다. 경연 기간(OPEN)에
  // 투표 영역이 열리고, 끝나면(CLOSED) 우승 표시와 함께 결과로 남는다. 실제 투표는
  // 무대팀이 경기마다 여는 것이라 OPEN 이어도 열린 경기가 없으면 투표할 수 없다.
  const votesTabLabel = contestPhase === "CLOSED" ? "경연 결과" : "경연 목록";
  const votesTabContent: ReactNode =
    status.isPending || votesQuery.isPending ? (
      <p className="pt-32 text-center text-base text-[#a2a2a2]">불러오는 중…</p>
    ) : status.isError || votesQuery.isError ? (
      <p className="pt-32 text-center text-base text-[#a2a2a2]">
        경연 목록을 불러오지 못했어요.
      </p>
    ) : votes.length === 0 ? (
      <p className="pt-32 text-center text-base">아직 대진표가 공개되지 않았어요</p>
    ) : (
      <ol className="space-y-5">
        {votes.map((vote) => (
          <li key={vote.singingVoteId}>
            <BracketMatchRow
              metaLabel={
                vote.status === "OPEN"
                  ? formatRemainingMinutes(vote.endsAt, new Date())
                  : undefined
              }
              vote={vote}
              winnerDisplay={contestPhase === "CLOSED" ? "color" : undefined}
            />
          </li>
        ))}
      </ol>
    );

  return (
    <main className="relative min-h-[calc(100dvh-64px)] w-full bg-[#1c1c1c] px-4 pb-24 text-[#fcfcfc]">
      <ContestOverview
        onTabChange={setTab}
        tab={tab}
        votesTabContent={votesTabContent}
        votesTabLabel={votesTabLabel}
      />

      {contestPhase === "BEFORE" && <ContestBeforeNotice />}
      {contestPhase === "CLOSED" && <ContestClosedNotice />}
      {contestPhase === "OPEN" && (
        <div className="mx-auto mt-10 flex w-full flex-col gap-6">
          <VoteCastingPanel />
          <ContestResults votes={votes} />
        </div>
      )}
    </main>
  );
}
