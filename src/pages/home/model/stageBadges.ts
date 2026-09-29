import type { StageStatus } from "@/entities/festival";

export type StoryShortcutBadgeStatus = "story-upcoming" | "story-open";
export type ContestShortcutBadgeStatus =
  "contest-upcoming" | "contest-open" | "contest-closed";
export type ShortcutBadgeStatus = StoryShortcutBadgeStatus | ContestShortcutBadgeStatus;

export const shortcutBadgeLabels: Record<ShortcutBadgeStatus, string> = {
  "story-upcoming": "사연 모집 예정",
  "story-open": "사연 모집 중",
  "contest-upcoming": "투표 예정",
  "contest-open": "투표 진행 중",
  "contest-closed": "투표 종료",
};

export interface StageShortcutBadges {
  story?: StoryShortcutBadgeStatus;
  contest?: ContestShortcutBadgeStatus;
}

export function getStageShortcutBadges(
  stage: Pick<StageStatus, "storyPhase" | "contestPhase"> | undefined,
): StageShortcutBadges {
  return {
    story:
      stage?.storyPhase === "BEFORE"
        ? "story-upcoming"
        : stage?.storyPhase === "OPEN"
          ? "story-open"
          : undefined,
    contest:
      stage?.contestPhase === "BEFORE"
        ? "contest-upcoming"
        : stage?.contestPhase === "OPEN"
          ? "contest-open"
          : stage?.contestPhase === "CLOSED"
            ? "contest-closed"
            : undefined,
  };
}
