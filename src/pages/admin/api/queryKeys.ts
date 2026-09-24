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

// 주막(PUB_ADMIN) 대시보드가 캐시하는 데이터의 정체성. 모든 주막 관리자 API는
// 로그인 계정에 묶인 부스만 다루므로(API 명세 §6) 키에 부스 식별자를 넣지
// 않는다. 계정이 바뀌면 로그아웃이 auth-me와 함께 이 캐시도 비운다.
export const pubAdminQueryKeys = {
  all: () => ["admin-pub"] as const,
  me: () => [...pubAdminQueryKeys.all(), "me"] as const,
  orders: () => [...pubAdminQueryKeys.all(), "orders"] as const,
  tables: () => [...pubAdminQueryKeys.all(), "tables"] as const,
};
