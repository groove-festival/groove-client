import type { StagePhase } from "@/entities/festival";

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
