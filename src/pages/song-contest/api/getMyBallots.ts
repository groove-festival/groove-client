import { useQuery } from "@tanstack/react-query";

import { type ApiEnvelope, httpClient, requestData } from "@/shared/api";

import { songContestQueryKeys } from "./queryKeys";

// SING-4. "완료된 투표" 표시용. SING-2 목록과 singingVoteId로 조합해 완료된
// 카드를 그린다. 필드명은 SING-2 실제 응답(singingVoteId·voteParticipantId)과
// 통일했다.
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
