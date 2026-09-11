// 공개 플레이리스트 페이지가 캐시하는 데이터의 정체성.
export const groovePlaylistQueryKeys = {
  all: () => ["groove-playlist"] as const,
  finalSongs: () => [...groovePlaylistQueryKeys.all(), "final-songs"] as const,
};
