import { useMutation, useQueryClient } from "@tanstack/react-query";

import { contestQueryKeys } from "@/entities/contest";
import { type ApiEnvelope, httpClient, requestData } from "@/shared/api";

import { songContestQueryKeys } from "./queryKeys";

// SING-3. 확인 팝업에서 "확정"을 눌렀을 때 호출한다. 계정당 경기당 1표이며
// 확정 후 수정·삭제 API는 없다. 필드명은 SING-2 실제 응답(singingVoteId·
// voteParticipantId)과 통일했다.
export interface SubmitBallotArgs {
  singingVoteId: number;
  voteParticipantId: number;
  // 프론트가 만든 UUIDv4. 더블탭 재요청에 원래 성공 응답을 재현한다 (§1.6).
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
      void queryClient.invalidateQueries({ queryKey: songContestQueryKeys.myBallots() });
      void queryClient.invalidateQueries({ queryKey: contestQueryKeys.votes() });
    },
  });
}
