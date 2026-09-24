import type { StagePhase } from "@/entities/festival";

// contestPhase가 다음으로 넘어갈 시각. BEFORE는 시작 시각, OPEN은 종료
// 시각이 다음 경계다. CLOSED 이후로는 더 이상 예약할 경계가 없다.
export function nextContestBoundaryAt(
  contestPhase: StagePhase | undefined,
  stage: { contestStartAt: string | null; contestEndAt: string | null },
): string | undefined {
  if (contestPhase === "BEFORE") {
    return stage.contestStartAt ?? undefined;
  }
  if (contestPhase === "OPEN") {
    return stage.contestEndAt ?? undefined;
  }
  return undefined;
}
