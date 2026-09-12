import { useQuery } from "@tanstack/react-query";

import { type ApiEnvelope, httpClient, requestData } from "@/shared/api";

import type { PlaylistPhase } from "../model/playlistPhase";
import { festivalQueryKeys } from "./queryKeys";

// 축제 단계. 플레이리스트 단계와 별개 값이다 — 접수 마감(9/16)과 축제 시작(10/1)은
// 2주 차이다.
export type FestivalPhase = "BEFORE" | "LIVE" | "AFTER";

export interface PlaylistStatus {
  phase: PlaylistPhase;
  // 접수 시작·마감(마감은 exclusive), 최종 공개 시각. 화면 전환 예약에 쓴다.
  submissionStartAt: string;
  submissionEndAt: string;
  publishAt: string;
}

export interface FestivalStatusResponseBody {
  phase: FestivalPhase;
  festivalStartAt: string;
  festivalEndAt: string;
  storyCollectionOpen: boolean;
  playlist: PlaylistStatus;
}

export async function getFestivalStatus(): Promise<FestivalStatusResponseBody> {
  return requestData(() =>
    httpClient.get<ApiEnvelope<FestivalStatusResponseBody>>("/festival/status"),
  );
}

export function useFestivalStatus() {
  return useQuery({
    queryKey: festivalQueryKeys.status(),
    queryFn: getFestivalStatus,
  });
}
