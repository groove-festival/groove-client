import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { type ApiEnvelope, httpClient, requestData } from "@/shared/api";

import { planAdminQueryKeys } from "./queryKeys";

export type RivalsCollege = "IT" | "NURSING" | "ART" | "SOCIAL" | "EDU" | "NATURE";

export interface AdminRivalScore {
  college: RivalsCollege;
  collegeName: string;
  score: number;
  rank: number;
}

interface RivalScoresResponse {
  scores: AdminRivalScore[];
  updatedAt: string | null;
}

export async function getAdminRivalScores(): Promise<RivalScoresResponse> {
  return requestData(() =>
    httpClient.get<ApiEnvelope<RivalScoresResponse>>("/rivals/scores"),
  );
}

export function useAdminRivalScores() {
  return useQuery({
    queryKey: planAdminQueryKeys.rivalScores(),
    queryFn: getAdminRivalScores,
    refetchInterval: 5_000,
  });
}

export interface AddRivalScoreArgs {
  college: RivalsCollege;

  points: number;
  reason: string | null;
}

export interface AddRivalScoreResult {
  college: RivalsCollege;
  score: number;
}

export async function addRivalScore(
  args: AddRivalScoreArgs,
): Promise<AddRivalScoreResult> {
  return requestData(() =>
    httpClient.post<ApiEnvelope<AddRivalScoreResult>>(
      "/admin/plan/rivals/scores",
      args,
    ),
  );
}

export function useAddRivalScore() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addRivalScore,
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: planAdminQueryKeys.rivalScores(),
      });
    },
  });
}
