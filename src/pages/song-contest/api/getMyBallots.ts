import { useQuery } from "@tanstack/react-query";

import { type ApiEnvelope, httpClient, requestData } from "@/shared/api";

import { songContestQueryKeys } from "./queryKeys";

export interface MyBallot {
  singingVoteId: number;
  voteParticipantId: number;
  votedAt: string;
}

export async function getMyBallots(): Promise<MyBallot[]> {
  return requestData(() =>
    httpClient.get<ApiEnvelope<MyBallot[]>>("/contest/my-ballots"),
  );
}

export function useMyBallots(enabled: boolean) {
  return useQuery({
    queryKey: songContestQueryKeys.myBallots(),
    queryFn: getMyBallots,
    enabled,
  });
}
