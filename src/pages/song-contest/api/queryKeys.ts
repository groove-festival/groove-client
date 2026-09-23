import { contestQueryKeys } from "@/entities/contest";

// 가요제 페이지가 캐시하는 참여자용 데이터의 정체성. 대진표 자체는
// entities/contest의 contestQueryKeys가 공용으로 관리한다.
export const songContestQueryKeys = {
  all: () => ["song-contest"] as const,
  stories: () => [...songContestQueryKeys.all(), "stories"] as const,
  myBallots: () => [...contestQueryKeys.all(), "my-ballots"] as const,
};
