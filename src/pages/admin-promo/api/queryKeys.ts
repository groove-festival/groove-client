// 관리자 페이지가 캐시하는 데이터의 정체성.
export const adminPromoQueryKeys = {
  all: () => ["admin-promo"] as const,
  authMe: () => [...adminPromoQueryKeys.all(), "auth-me"] as const,
  songRequests: () => [...adminPromoQueryKeys.all(), "song-requests"] as const,
};
