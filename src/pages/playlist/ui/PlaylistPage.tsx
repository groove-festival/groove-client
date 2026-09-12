import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router";

import { type PlaylistPhase, useFestivalStatus } from "@/entities/festival";

import { parsePlaylistPhaseOverride } from "../model/playlistPhase";
import { useScheduledRefetch } from "../model/useScheduledRefetch";
import { ClosedSection } from "./ClosedSection";
import { CountdownSection } from "./CountdownSection";
import { FestivalHero, PLAYLIST_BOTTOM_ANCHOR_ID } from "./FestivalHero";
import { PlaylistStatusError } from "./PlaylistStatusError";
import { SongRequestForm } from "./SongRequestForm";

const SCROLL_SETTLE_DELAY_MS = 180;
const SCROLL_FALLBACK_DELAY_MS = 1_000;
const PLAYLIST_BOTTOM_HASH = `#${PLAYLIST_BOTTOM_ANCHOR_ID}`;

// 현재 단계에서 다음으로 넘어가는 경계 시각. 이 시각에 status를 다시 불러와
// 화면이 페이지를 열어둔 채로도 다음 단계로 전환되게 한다.
const nextBoundaryAt = (
  phase: PlaylistPhase | undefined,
  playlist: { submissionStartAt: string; submissionEndAt: string; publishAt: string },
): string | undefined => {
  if (phase === "BEFORE_OPEN") {
    return playlist.submissionStartAt;
  }
  if (phase === "SUBMISSION") {
    return playlist.submissionEndAt;
  }
  if (phase === "SELECTION") {
    return playlist.publishAt;
  }
  return undefined;
};

export default function PlaylistPage() {
  const [searchParams] = useSearchParams();
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const isGuideScrollPendingRef = useRef(false);
  const cancelScrollWaitRef = useRef<(() => void) | null>(null);
  const override = parsePlaylistPhaseOverride(searchParams.get("phase"));
  const { data: status, isPending, refetch } = useFestivalStatus();

  const phase = override ?? status?.playlist?.phase;
  useScheduledRefetch(
    override || !status?.playlist ? undefined : nextBoundaryAt(phase, status.playlist),
    refetch,
  );

  // BEFORE_OPEN만 카운트다운 높이(3121px), 나머지 단계는 3195px. SongRequestForm은
  // absolute 배치라 자식 높이가 이 컨테이너 높이에 반영되지 않는다 — 검색 결과처럼
  // 늘어나는 콘텐츠는 오버레이로 띄워서 이 고정 높이를 넘지 않게 한다.
  const heightClass = phase === "BEFORE_OPEN" ? "h-[3121px]" : "h-[3195px]";

  useLayoutEffect(() => {
    const previousScrollRestoration = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";

    if (window.location.hash === PLAYLIST_BOTTOM_HASH) {
      window.history.replaceState(
        null,
        "",
        `${window.location.pathname}${window.location.search}`,
      );
    }
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });

    return () => {
      window.history.scrollRestoration = previousScrollRestoration;
    };
  }, []);

  const requestGuideOpen = () => {
    setIsGuideOpen(true);
  };

  const cancelScrollWait = () => {
    cancelScrollWaitRef.current?.();
    cancelScrollWaitRef.current = null;
    isGuideScrollPendingRef.current = false;
  };

  const finishGuideScroll = () => {
    isGuideScrollPendingRef.current = false;
    requestGuideOpen();
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
    if (isGuideScrollPendingRef.current) {
      return;
    }

    requestGuideOpen();
  };

  useEffect(() => {
    return () => {
      cancelScrollWaitRef.current?.();
      cancelScrollWaitRef.current = null;
      isGuideScrollPendingRef.current = false;
    };
  }, []);

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#1c1c1c] text-[#fcfcfc]">
      <div
        className={`relative w-full overflow-hidden bg-[#1c1c1c] ${heightClass}`}
        id="top"
      >
        <FestivalHero onBottomArrowClick={handleBottomArrowClick} />

        {phase === "BEFORE_OPEN" && (
          <CountdownSection targetIso={status?.playlist?.submissionStartAt} />
        )}
        {phase === "SUBMISSION" && (
          <SongRequestForm
            guideOpen={isGuideOpen}
            onGuideClose={() => setIsGuideOpen(false)}
            onGuideSectionEnter={handleGuideSectionEnter}
          />
        )}
        {phase === "SELECTION" && <ClosedSection variant="selection" />}
        {phase === "PUBLISHED" && <ClosedSection variant="published" />}
        {/* phase가 없으면 로딩 중이거나, 요청은 성공했어도 응답에 playlist 단계
            정보가 없는 경우(예: 계약 불일치)다. 어느 쪽이든 화면을 비워두지 않고
            안내한다. */}
        {!phase && isPending && (
          <p className="absolute top-[2600px] left-1/2 -translate-x-1/2 text-sm text-[#a2a2a2]">
            축제 정보를 불러오는 중…
          </p>
        )}
        {!phase && !isPending && <PlaylistStatusError onRetry={() => void refetch()} />}
      </div>
    </main>
  );
}
