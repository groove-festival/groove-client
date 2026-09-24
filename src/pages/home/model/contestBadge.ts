export type ContestBadgeStatus = "story" | "vote";

export const contestBadgeLabels: Record<ContestBadgeStatus, string> = {
  story: "사연 모집중",
  vote: "투표 진행중",
};

// 배지 상태 API(FR-0.4) 연동 전까지 쓰는 임시 상수. 단계가 바뀌면 이 값을 바꾼다.
export const CONTEST_BADGE_STATUS: ContestBadgeStatus = "story";
