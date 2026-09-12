import { useMutation } from "@tanstack/react-query";

import { type ApiEnvelope, httpClient, requestData } from "@/shared/api";

// PLST-2 검색 결과의 한 곡. 신청(PLST-3)은 이 trackId만 받는다.
export interface SongTrack {
  trackId: string;
  title: string;
  artist: string;
  albumCoverUrl?: string;
}

interface SongSearchResponseBody {
  tracks: SongTrack[];
}

// 프론트는 검색 버튼을 눌렀을 때만 호출한다 — 타이핑마다 호출하면 한 번의 신청이
// 외부 API 호출 수 건을 소비해 한도에 걸린다. 결과가 없으면 빈 배열.
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
