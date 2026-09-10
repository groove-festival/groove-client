export type PlaylistPhase = "before" | "during" | "after";

const playlistPhases: readonly PlaylistPhase[] = ["before", "during", "after"] as const;

// URL의 `phase` 파라미터를 개발·미리보기용 강제값으로 해석한다. 유효한 값이
// 아니면 null을 돌려주고, 이때 실제 단계는 접수 일정(playlistSchedule)이 정한다.
export function parsePlaylistPhaseOverride(value: string | null): PlaylistPhase | null {
  return playlistPhases.find((phase) => phase === value) ?? null;
}
