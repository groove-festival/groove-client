// 가요제 페이지가 캐시하는 참여자용 데이터의 정체성.
export const songContestQueryKeys = {
  all: () => ["song-contest"] as const,
  stories: () => [...songContestQueryKeys.all(), "stories"] as const,
};
