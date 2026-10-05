import { useMutation, useQueryClient } from "@tanstack/react-query";

import { contestQueryKeys } from "@/entities/contest";
import { type ApiEnvelope, httpClient, requestData } from "@/shared/api";

import { songContestQueryKeys } from "./queryKeys";

export interface SubmitBallotArgs {
  singingVoteId: number;
  voteParticipantId: number;

  idempotencyKey: string;
}

export interface SubmitBallotResponseBody {
  singingVoteId: number;
  voteParticipantId: number;
  votedAt: string;
}

export async function submitBallot({
  singingVoteId,
  voteParticipantId,
  idempotencyKey,
}: SubmitBallotArgs): Promise<SubmitBallotResponseBody> {
  return requestData(() =>
    httpClient.post<ApiEnvelope<SubmitBallotResponseBody>>(
      `/contest/votes/${singingVoteId}/ballots`,
      { voteParticipantId },
      { headers: { "Idempotency-Key": idempotencyKey } },
    ),
  );
}

export function useSubmitBallot() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: submitBallot,
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: songContestQueryKeys.myBallots(),
      });
      void queryClient.invalidateQueries({ queryKey: contestQueryKeys.votes() });
    },
  });
}
