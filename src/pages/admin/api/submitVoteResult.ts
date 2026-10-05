import { useMutation, useQueryClient } from "@tanstack/react-query";

import { contestQueryKeys, type Vote } from "@/entities/contest";
import { type ApiEnvelope, httpClient, requestData } from "@/shared/api";

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
      void queryClient.invalidateQueries({ queryKey: contestQueryKeys.votes() });
    },
  });
}
