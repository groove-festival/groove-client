export type PlaylistPhase = "before" | "during" | "after";

const playlistPhases: readonly PlaylistPhase[] = ["before", "during", "after"] as const;

// 접수 여정 중 "신청 중" 화면을 기본값으로 둔다. 실제 단계 자동/수동 전환은
// 후속 이슈(PRD §11-16)에서 다루며, 여기서는 정적 UI 확인용 값 파싱만 한다.
export const DEFAULT_PLAYLIST_PHASE: PlaylistPhase = "during";

export function parsePlaylistPhase(value: string | null): PlaylistPhase {
  return playlistPhases.find((phase) => phase === value) ?? DEFAULT_PLAYLIST_PHASE;
}
