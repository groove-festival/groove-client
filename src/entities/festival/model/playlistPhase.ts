// GROOVE PLAYLIST 단계 (festival/status의 playlist.phase). 화면은 이 값으로
// 카운트다운 → 신청 폼 → 마감 안내 → 공개 CTA 를 전환한다. 축제 phase(3단계)와는
// 별개 값이다.
export const playlistPhases = [
  "BEFORE_OPEN",
  "SUBMISSION",
  "SELECTION",
  "PUBLISHED",
] as const;

export type PlaylistPhase = (typeof playlistPhases)[number];
