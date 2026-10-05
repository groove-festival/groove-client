import { useQuery } from "@tanstack/react-query";

import { ApiError, type ApiEnvelope, httpClient, requestData } from "@/shared/api";

import { groovePlaylistQueryKeys } from "./queryKeys";

export type PlaylistCollege = "IT" | "NURSING" | "ART" | "SOCIAL" | "EDU" | "NATURE";

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
