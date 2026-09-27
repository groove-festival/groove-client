import type { StagePhase, StageStatus } from "@/entities/festival";

const overrideAliases: Record<string, StagePhase> = {
  before: "BEFORE",
  open: "OPEN",
  closed: "CLOSED",
};

export function parseStoryPhaseOverride(value: string | null): StagePhase | null {
  if (!value) {
    return null;
  }

  return overrideAliases[value.trim().toLowerCase()] ?? null;
}

export function nextStoryBoundaryAt(
  phase: StagePhase | undefined,
  stage: StageStatus | undefined,
): string | undefined {
  if (!stage) {
    return undefined;
  }
  if (phase === "BEFORE") {
    return stage.storyCollectionStartAt ?? undefined;
  }
  if (phase === "OPEN") {
    return stage.storyCollectionEndAt ?? undefined;
  }
  return undefined;
}
