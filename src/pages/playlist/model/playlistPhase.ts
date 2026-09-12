import type { PlaylistPhase } from "@/entities/festival";

// `?phase=` 쿼리를 개발·미리보기용 강제값으로 해석한다. 명세 enum과 과거
// 별칭(before/during/after)을 모두 받아준다. 유효하지 않으면 null을 돌려주고,
// 이때 실제 단계는 festival/status가 정한다.
const overrideAliases: Record<string, PlaylistPhase> = {
  before_open: "BEFORE_OPEN",
  before: "BEFORE_OPEN",
  submission: "SUBMISSION",
  during: "SUBMISSION",
  selection: "SELECTION",
  after: "SELECTION",
  published: "PUBLISHED",
};

export function parsePlaylistPhaseOverride(value: string | null): PlaylistPhase | null {
  if (!value) {
    return null;
  }

  return overrideAliases[value.trim().toLowerCase()] ?? null;
}
