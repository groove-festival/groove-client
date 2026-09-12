// 축제 전역 상태가 캐시하는 데이터의 정체성.
export const festivalQueryKeys = {
  all: () => ["festival"] as const,
  status: () => [...festivalQueryKeys.all(), "status"] as const,
};
