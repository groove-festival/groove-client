import { useQuery } from "@tanstack/react-query";

import { type ApiEnvelope, httpClient, requestData } from "@/shared/api";

import type { RivalScore } from "../model/rivals";
import { eventQueryKeys } from "./queryKeys";

// 실시간 갱신은 폴링 5초로 통일한다 (API 명세 §1.6).
export const RIVAL_SCORES_POLL_INTERVAL_MS = 5000;

interface RivalScoresResponse {
  scores: RivalScore[];
  // 마지막 점수 입력 시각. 입력이 한 건도 없으면 null이다.
  updatedAt: string | null;
}

// PLAN-2. 단대 6건이 점수 내림차순으로 항상 전부 내려온다.
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
