import { contestQueryKeys } from "@/entities/contest";

// 참여자 전용 데이터(내 투표 내역)의 정체성. 대진표 자체는
// entities/contest의 contestQueryKeys가 공용으로 관리한다.
export const songContestQueryKeys = {
  myBallots: () => [...contestQueryKeys.all(), "my-ballots"] as const,
};
