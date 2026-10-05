import { useQuery } from "@tanstack/react-query";

import { type ApiEnvelope, httpClient, requestData } from "@/shared/api";

import type { PlaylistPhase } from "../model/playlistPhase";
import { festivalQueryKeys } from "./queryKeys";

export type FestivalPhase = "BEFORE" | "LIVE" | "AFTER";

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
