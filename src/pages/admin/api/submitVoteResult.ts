import { useMutation, useQueryClient } from "@tanstack/react-query";

import { contestQueryKeys, type Vote } from "@/entities/contest";
import { type ApiEnvelope, httpClient, requestData } from "@/shared/api";

// SING-A8. 참가팀 전원에게 1위부터 빠짐없이 순위를 매긴다. 1위는 서버가 다음
// 라운드 경기 자리에 자동으로 올린다. 다시 입력하면 덮어쓴다.
export interface SubmitVoteResultArgs {
  singingVoteId: number;
  results: { voteParticipantId: number; rank: number }[];
}

export async function submitVoteResult({
  singingVoteId,
  results,
}: SubmitVoteResultArgs): Promise<Vote> {
  return requestData(() =>
    httpClient.put<ApiEnvelope<Vote>>(`/admin/stage/votes/${singingVoteId}/result`, {
      results,
    }),
  );
}

export function useSubmitVoteResult() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: submitVoteResult,
    onSuccess: () => {
      // 다음 라운드 참가팀도 함께 바뀌므로 대진표 전체를 무효화한다.
      void queryClient.invalidateQueries({ queryKey: contestQueryKeys.votes() });
    },
  });
}
