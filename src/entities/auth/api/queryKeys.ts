// 로그인 상태가 캐시하는 데이터의 정체성. admin·song-contest 등 로그인
// 여부를 확인하는 모든 슬라이스가 공용으로 쓴다.
export const authQueryKeys = {
  all: () => ["auth"] as const,
  me: () => [...authQueryKeys.all(), "me"] as const,
};
