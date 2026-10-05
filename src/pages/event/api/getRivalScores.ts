import { useQuery } from "@tanstack/react-query";

import { type ApiEnvelope, httpClient, requestData } from "@/shared/api";

import type { RivalScore } from "../model/rivals";
import { eventQueryKeys } from "./queryKeys";

export const RIVAL_SCORES_POLL_INTERVAL_MS = 5000;

interface RivalScoresResponse {
  scores: RivalScore[];

  updatedAt: string | null;
}

export async function getRivalScores(): Promise<RivalScore[]> {
  const { scores } = await requestData(() =>
    httpClient.get<ApiEnvelope<RivalScoresResponse>>("/rivals/scores"),
  );

  return scores;
}

export function useRivalScores() {
  return useQuery({
    queryKey: eventQueryKeys.rivalScores(),
    queryFn: getRivalScores,
    refetchInterval: RIVAL_SCORES_POLL_INTERVAL_MS,
  });
}
