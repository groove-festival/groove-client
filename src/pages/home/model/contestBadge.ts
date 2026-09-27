import type { StageStatus } from "@/entities/festival";

export type ContestBadgeStatus = "story-upcoming" | "story" | "vote";

export const contestBadgeLabels: Record<ContestBadgeStatus, string> = {
  "story-upcoming": "사연 모집예정",
  story: "사연 모집중",
  vote: "투표진행중",
};

export function getContestBadgeStatus(
  stage: Pick<StageStatus, "storyPhase" | "contestPhase"> | undefined,
): ContestBadgeStatus | undefined {
  if (stage?.contestPhase === "OPEN") {
    return "vote";
  }

  if (stage?.storyPhase === "OPEN") {
    return "story";
  }

  if (stage?.storyPhase === "BEFORE") {
    return "story-upcoming";
  }

  return undefined;
}
