import { useQuery } from "@tanstack/react-query";

import { ApiError, type ApiEnvelope, httpClient, requestData } from "@/shared/api";

import { groovePlaylistQueryKeys } from "./queryKeys";

export type PlaylistCollege = "IT" | "NURSING" | "ART" | "SOCIAL" | "EDU" | "NATURE";

// PLST-5 공개 목록의 한 곡. 안정적 식별자가 없어 배열 순서가 곧 공개(재생)
// 순서다. albumCoverUrl은 없을 수 있으니 프론트가 기본 이미지로 폴백한다.
export interface FinalPlaylistSong {
  title: string;
  artist: string;
  nickname: string;
  college: PlaylistCollege;
  albumCoverUrl?: string;
  updatedAt: string;
}

interface SongListResponseBody {
  totalCount: number;
  songs: FinalPlaylistSong[];
}

// 공개 단계 아님(PLST006)은 축제 기간이 아직 아니라는 정상 상태다 — 재시도로
// 풀리지 않으므로 이 코드로 구분한다.
export function isNotPublishedYet(error: unknown): boolean {
  return error instanceof ApiError && error.code === "PLST006";
}

export async function getFinalPlaylist(): Promise<FinalPlaylistSong[]> {
  const { songs } = await requestData<SongListResponseBody>(() =>
    httpClient.get<ApiEnvelope<SongListResponseBody>>("/playlist/final-songs"),
  );

  return songs;
}

export function useFinalPlaylist() {
  return useQuery({
    queryKey: groovePlaylistQueryKeys.finalSongs(),
    queryFn: getFinalPlaylist,
    retry: (failureCount, error) => !isNotPublishedYet(error) && failureCount < 1,
  });
}
