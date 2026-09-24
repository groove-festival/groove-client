// 가요제 대진표 데이터의 정체성. 참여자·무대팀 관리자 양쪽이 공용으로 쓴다.
export const contestQueryKeys = {
  all: () => ["contest"] as const,
  votes: () => [...contestQueryKeys.all(), "votes"] as const,
};
