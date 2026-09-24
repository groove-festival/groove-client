import { useState } from "react";

import type { Vote } from "@/entities/contest";

import { useSubmitVoteResult } from "../api/submitVoteResult";
import { submitVoteResultErrorMessage } from "../model/adminErrorMessages";

interface StageVoteResultFormProps {
  vote: Vote;
}

// SING-A8. 참가팀 전원에게 1위부터 빠짐없이·중복 없이 순위를 매긴다. 1·2라운드는
// 1위만 진출, 3라운드는 1·2·3위를 모두 가린다.
export function StageVoteResultForm({ vote }: StageVoteResultFormProps) {
  const submitResult = useSubmitVoteResult();
  const [ranks, setRanks] = useState<Record<number, string>>({});

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const results = vote.participants.map((participant) => ({
      voteParticipantId: participant.voteParticipantId,
      rank: Number(ranks[participant.voteParticipantId]),
    }));
    if (results.some((result) => !Number.isInteger(result.rank) || result.rank < 1)) {
      return;
    }
    submitResult.mutate({ singingVoteId: vote.singingVoteId, results });
  };

  return (
    <form
      className="flex flex-col gap-2 rounded-lg bg-[#1c1c1c] p-3"
      onSubmit={onSubmit}
    >
      {vote.participants.map((participant) => (
        <label
          className="flex items-center justify-between gap-2 text-xs"
          key={participant.voteParticipantId}
        >
          {participant.name}
          <input
            className="h-8 w-16 rounded-md border border-[#5d5d5d] bg-[#323232] px-2 text-center text-sm text-[#fcfcfc] outline-none focus:border-[#00ffff]"
            inputMode="numeric"
            onChange={(event) =>
              setRanks((prev) => ({
                ...prev,
                [participant.voteParticipantId]: event.target.value,
              }))
            }
            placeholder="순위"
            value={ranks[participant.voteParticipantId] ?? ""}
          />
        </label>
      ))}

      {submitResult.isError && (
        <p className="text-xs text-[#ff5b5b]">
          {submitVoteResultErrorMessage(submitResult.error)}
        </p>
      )}
      {submitResult.isSuccess && (
        <p className="text-xs text-[#7bffb0]">결과를 저장했어요.</p>
      )}

      <button
        className="h-8 rounded-lg bg-[#5d00ff] text-xs font-semibold text-[#fcfcfc] disabled:opacity-50"
        disabled={submitResult.isPending}
        type="submit"
      >
        결과 저장
      </button>
    </form>
  );
}
