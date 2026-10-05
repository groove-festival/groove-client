import { useMutation } from "@tanstack/react-query";

import { type ApiEnvelope, httpClient, requestData } from "@/shared/api";

export interface SongTrack {
  trackId: string;
  title: string;
  artist: string;
  albumCoverUrl?: string;
}

interface SongSearchResponseBody {
  tracks: SongTrack[];
}

export async function searchSongs(keyword: string): Promise<SongTrack[]> {
  const { tracks } = await requestData<SongSearchResponseBody>(() =>
    httpClient.get<ApiEnvelope<SongSearchResponseBody>>("/playlist/search", {
      params: { keyword },
    }),
  );

  return tracks;
}

export function useSearchSongs() {
  return useMutation({ mutationFn: searchSongs });
}
