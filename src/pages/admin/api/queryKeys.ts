// 홍보팀(PROMO_ADMIN) 대시보드가 캐시하는 데이터의 정체성. 로그인
// 상태(auth-me)는 entities/auth의 authQueryKeys가 공용으로 관리한다.
export const promoAdminQueryKeys = {
  all: () => ["admin-promo"] as const,
  songRequests: () => [...promoAdminQueryKeys.all(), "song-requests"] as const,
};

// 무대팀(STAGE_ADMIN) 대시보드가 캐시하는 데이터의 정체성. 대진표 자체는
// entities/contest의 contestQueryKeys가 참여자 화면과 공용으로 관리한다.
export const stageAdminQueryKeys = {
  all: () => ["admin-stage"] as const,
  stories: () => [...stageAdminQueryKeys.all(), "stories"] as const,
  voteResults: (singingVoteId: number) =>
    [...stageAdminQueryKeys.all(), "vote-results", singingVoteId] as const,
};
