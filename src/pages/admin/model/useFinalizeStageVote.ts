import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { contestQueryKeys, type Vote } from "@/entities/contest";

import { submitVoteResult, type SubmitVoteResultArgs } from "../api/submitVoteResult";
import { toggleVoteStatus } from "../api/toggleVoteStatus";
import {
  submitVoteResultErrorMessage,
  toggleVoteStatusErrorMessage,
} from "./adminErrorMessages";

class StageVoteFinalizationError extends Error {
  constructor(
    readonly step: "close" | "result",
    readonly originalError: unknown,
    readonly votingClosed = false,
  ) {
    super("Stage vote finalization failed");
    this.name = "StageVoteFinalizationError";
  }
}

export const useFinalizeStageVote = (vote: Vote) => {
  const queryClient = useQueryClient();
  const [closedVote, setClosedVote] = useState<Pick<
    Vote,
    "singingVoteId" | "endsAt"
  > | null>(null);
  const isOpen =
    vote.status === "OPEN" &&
    (closedVote?.singingVoteId !== vote.singingVoteId ||
      closedVote.endsAt !== vote.endsAt);

  const finalize = useMutation({
    mutationFn: async (results: SubmitVoteResultArgs["results"]) => {
      let votingClosed =
        vote.status === "CLOSED" || (vote.status === "OPEN" && !isOpen);
      if (isOpen) {
        try {
          await toggleVoteStatus({
            singingVoteId: vote.singingVoteId,
            status: "CLOSED",
          });
          setClosedVote({ singingVoteId: vote.singingVoteId, endsAt: vote.endsAt });
          votingClosed = true;
        } catch (error) {
          throw new StageVoteFinalizationError("close", error);
        }
      }
      try {
        return await submitVoteResult({ singingVoteId: vote.singingVoteId, results });
      } catch (error) {
        throw new StageVoteFinalizationError("result", error, votingClosed);
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: contestQueryKeys.votes() });
    },
  });

  const error = finalize.error;
  const errorMessage =
    error instanceof StageVoteFinalizationError
      ? error.step === "close"
        ? toggleVoteStatusErrorMessage(error.originalError)
        : `${error.votingClosed ? "투표는 마감됐지만 결과를 저장하지 못했어요. " : ""}${submitVoteResultErrorMessage(error.originalError)}`
      : undefined;

  return { ...finalize, isOpen, errorMessage };
};
