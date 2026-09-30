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

// 투표가 열려 있는 동안(live)은 5초마다 다시 받는다. 결과를 고르는 화면에서
// 득표가 멈춘 숫자로 보이면 판단이 어긋난다.
export function useVoteResults(singingVoteId: number, { live = false } = {}) {
  return useQuery({
    queryKey: stageAdminQueryKeys.voteResults(singingVoteId),
    queryFn: () => getVoteResults(singingVoteId),
    refetchInterval: live ? 5_000 : false,
  });
}
