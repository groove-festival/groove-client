import { useEffect } from "react";
import { useSearchParams } from "react-router";

import { useFestivalStatus } from "@/entities/festival";
import { useScheduledRefetch } from "@/shared/lib/scheduling";
import { LoadingFallback, NetworkErrorFallback } from "@/shared/ui";
import { FestivalHero } from "@/widgets/festival-hero";

import {
  nextPlaylistBoundaryAt,
  parsePlaylistPhaseOverride,
} from "../model/playlistPhase";
import { trackPlaylistEvent } from "../model/playlistTelemetry";
import { usePlaylistEntryScroll } from "../model/usePlaylistEntryScroll";
import { usePlaylistGuideScroll } from "../model/usePlaylistGuideScroll";
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

        {!phase && !isPending && !isError && (
          <PlaylistStatusError onRetry={() => void refetch()} />
        )}
      </div>
    </main>
  );
}
