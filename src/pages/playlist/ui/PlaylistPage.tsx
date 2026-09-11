import { useSearchParams } from "react-router";

import { type PlaylistPhase, useFestivalStatus } from "@/entities/festival";

import { parsePlaylistPhaseOverride } from "../model/playlistPhase";
import { useScheduledRefetch } from "../model/useScheduledRefetch";
import { ClosedSection } from "./ClosedSection";
import { CountdownSection } from "./CountdownSection";
import { FestivalHero } from "./FestivalHero";
import { PlaylistStatusError } from "./PlaylistStatusError";
import { SongRequestForm } from "./SongRequestForm";

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

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#1c1c1c] text-[#fcfcfc]">
      <div
        className={`relative w-full overflow-hidden bg-[#1c1c1c] ${heightClass}`}
        id="top"
      >
        <FestivalHero />

        {phase === "BEFORE_OPEN" && (
          <CountdownSection targetIso={status?.playlist?.submissionStartAt} />
        )}
        {phase === "SUBMISSION" && <SongRequestForm />}
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
