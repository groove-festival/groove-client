import { useQuery } from "@tanstack/react-query";

import { type ApiEnvelope, httpClient, requestData } from "@/shared/api";

import { stageAdminQueryKeys } from "./queryKeys";

// SING-A3. 진행 중(OPEN)인 경기도 포함해 언제든 득표 현황을 조회한다. 참여자용
// 조회 경로가 없는, 득표를 보는 유일한 경로다.
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

export function useVoteResults(singingVoteId: number) {
  return useQuery({
    queryKey: stageAdminQueryKeys.voteResults(singingVoteId),
    queryFn: () => getVoteResults(singingVoteId),
  });
}
