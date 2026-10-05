import { useQuery } from "@tanstack/react-query";

import { type ApiEnvelope, httpClient, requestData } from "@/shared/api";

import { stageAdminQueryKeys } from "./queryKeys";

export interface VoteResultEntry {
  voteParticipantId: number;
  voteCount: number;
}

export interface VoteResultsResponseBody {
  totalVotes: number;
  tallies: VoteResultEntry[];
}

export async function getVoteResults(
  singingVoteId: number,
): Promise<VoteResultsResponseBody> {
  return requestData(() =>
    httpClient.get<ApiEnvelope<VoteResultsResponseBody>>(
      `/admin/stage/votes/${singingVoteId}/results`,
    ),
  );
}

export function useVoteResults(singingVoteId: number, { live = false } = {}) {
  return useQuery({
    queryKey: stageAdminQueryKeys.voteResults(singingVoteId),
    queryFn: () => getVoteResults(singingVoteId),
    refetchInterval: live ? 5_000 : false,
  });
}
