import { useQuery } from "@tanstack/react-query";

import { type ApiEnvelope, httpClient, requestData } from "@/shared/api";

import type { PlaylistPhase } from "../model/playlistPhase";
import { festivalQueryKeys } from "./queryKeys";

// 축제 단계. 플레이리스트 단계와 별개 값이다 — 접수 마감(9/16)과 축제 시작(10/1)은
// 2주 차이다.
export type FestivalPhase = "BEFORE" | "LIVE" | "AFTER";

// 무대(가요제) 단계. 사연 모집(storyPhase)과 경연(contestPhase) 각각에 쓰인다.
// boolean 토글이 아니라 시각 4개로부터 반열림 판정되므로 "아직 안 열렸다"와
// "이미 끝났다"를 구분할 수 있다.
export type StagePhase = "BEFORE" | "OPEN" | "CLOSED";

export interface StageStatus {
  storyPhase: StagePhase;
  storyCollectionStartAt: string | null;
  storyCollectionEndAt: string | null;
  contestPhase: StagePhase;
  contestStartAt: string | null;
  contestEndAt: string | null;
}

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
  stage: StageStatus;
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
