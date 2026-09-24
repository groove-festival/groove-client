import { useEffect } from "react";
import { useSearchParams } from "react-router";

import { useFestivalStatus } from "@/entities/festival";
import { LoadingFallback, NetworkErrorFallback } from "@/shared/ui";
import { FestivalHero } from "@/widgets/festival-hero";

import {
  nextPlaylistBoundaryAt,
  parsePlaylistPhaseOverride,
} from "../model/playlistPhase";
import { trackPlaylistEvent } from "../model/playlistTelemetry";
import { usePlaylistEntryScroll } from "../model/usePlaylistEntryScroll";
import { usePlaylistGuideScroll } from "../model/usePlaylistGuideScroll";
import { useScheduledRefetch } from "../model/useScheduledRefetch";
import { ClosedSection } from "./ClosedSection";
import { CountdownSection } from "./CountdownSection";
import { PlaylistStatusError } from "./PlaylistStatusError";
import { SongRequestForm } from "./SongRequestForm";

export default function PlaylistPage() {
  const [searchParams] = useSearchParams();
  const override = parsePlaylistPhaseOverride(searchParams.get("phase"));
  const { data: status, isError, isPending, refetch } = useFestivalStatus();

  const phase = override ?? status?.playlist?.phase;
  usePlaylistEntryScroll();
  const { isGuideOpen, closeGuide, handleBottomArrowClick, handleGuideSectionEnter } =
    usePlaylistGuideScroll(phase);
  useScheduledRefetch(
    override || !status?.playlist
      ? undefined
      : nextPlaylistBoundaryAt(phase, status.playlist),
    refetch,
  );

  useEffect(() => {
    if (phase) {
      trackPlaylistEvent({ eventName: "playlist_view", phase });
    }
  }, [phase]);

  // BEFORE_OPEN은 카운트다운 높이(3121px), SUBMISSION은 신청 폼 높이(3396px),
  // 마감/공개 단계는 기존 안내 섹션 높이(3195px).
  // SongRequestForm은 absolute 배치라 자식 높이가 이 컨테이너 높이에 반영되지
  // 않는다 — 검색 결과처럼 늘어나는 콘텐츠는 오버레이로 띄워서 이 고정 높이를
  // 넘지 않게 한다.
  const heightClass =
    phase === "BEFORE_OPEN"
      ? "h-[3121px]"
      : phase === "SUBMISSION"
        ? "h-[3396px]"
        : "h-[3195px]";

  if (!phase && isError) {
    return <NetworkErrorFallback />;
  }

  if (!phase && isPending) {
    return <LoadingFallback />;
  }

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
            onGuideClose={closeGuide}
            onGuideSectionEnter={handleGuideSectionEnter}
          />
        )}
        {phase === "SELECTION" && <ClosedSection variant="selection" />}
        {phase === "PUBLISHED" && <ClosedSection variant="published" />}
        {/* phase가 없으면 로딩 중이거나, 요청은 성공했어도 응답에 playlist 단계
            정보가 없는 경우(예: 계약 불일치)다. 어느 쪽이든 화면을 비워두지 않고
            안내한다. */}
        {!phase && !isPending && !isError && (
          <PlaylistStatusError onRetry={() => void refetch()} />
        )}
      </div>
    </main>
  );
}
