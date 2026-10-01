import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { type ApiEnvelope, httpClient, requestData } from "@/shared/api";

import { planAdminQueryKeys } from "./queryKeys";

export type RivalsCollege = "IT" | "NURSING" | "ART" | "SOCIAL" | "EDU" | "NATURE";

// PLAN-2 응답의 점수 한 줄. 단대 6건이 점수 내림차순으로 항상 전부 온다.
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

// PLAN-2. 참여자 이벤트 화면과 같은 공개 점수판이다. 여러 기획팀원이 동시에
// 입력하므로 5초마다 다시 받는다.
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
  // 음수면 차감이다(오입력 정정).
  points: number;
  reason: string | null;
}

export interface AddRivalScoreResult {
  college: RivalsCollege;
  score: number;
}

// PLAN-A1. 점수는 덮어쓰지 않고 더한다. 정정은 음수로 넣는다.
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
