import type { PlaylistPhase } from "./playlistPhase";

// 노래 신청 접수 구간. 축제 운영 기준 시각은 KST(UTC+9)다.
export const SONG_REQUEST_OPENS_AT = new Date("2026-09-12T00:00:00+09:00");
export const SONG_REQUEST_CLOSES_AT = new Date("2026-09-17T00:00:00+09:00");

// 주어진 시각이 어느 단계에 속하는지 판정한다. 오픈 전이면 카운트다운,
// 접수 중이면 신청 폼, 마감 후면 마감 안내를 노출한다.
export function resolvePlaylistPhaseAt(now: Date): PlaylistPhase {
  const nowMs = now.getTime();

  if (nowMs < SONG_REQUEST_OPENS_AT.getTime()) {
    return "before";
  }
  if (nowMs < SONG_REQUEST_CLOSES_AT.getTime()) {
    return "during";
  }
  return "after";
}
