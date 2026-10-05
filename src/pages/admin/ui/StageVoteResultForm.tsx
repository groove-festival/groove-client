import { useState } from "react";

import type { Vote } from "@/entities/contest";

import { useVoteResults } from "../api/getVoteResults";
import { useFinalizeStageVote } from "../model/useFinalizeStageVote";
import {
  assignRank,
  describeRanking,
  initialRankSelection,
  isCompleteRanking,
  pickWinner,
  type RankSelection,
} from "../model/stageVoteResult";
import { ConfirmDialog } from "./ConfirmDialog";

interface StageVoteResultFormProps {
  vote: Vote;
}

export function StageVoteResultForm({ vote }: StageVoteResultFormProps) {
  const finalize = useFinalizeStageVote(vote);
  const tallies = useVoteResults(vote.singingVoteId, { live: vote.status === "OPEN" });
  const [selection, setSelection] = useState<RankSelection>(() =>
    initialRankSelection(vote),
  );
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const isFinal = vote.participants.length > 2;
  const isOpen = finalize.isOpen;
  const isComplete = isCompleteRanking(vote, selection);
  const isSaving = finalize.isPending;
  const countOf = new Map(
    (tallies.data?.tallies ?? []).map((entry) => [
      entry.voteParticipantId,
      entry.voteCount,
    ]),
  );

  const confirm = () => {
    setIsConfirmOpen(false);
    finalize.mutate(
      vote.participants.map((participant) => ({
        voteParticipantId: participant.voteParticipantId,
        rank: selection[participant.voteParticipantId],
      })),
    );
  };

  return (
    <div className="flex flex-col gap-2 rounded-lg bg-[#1c1c1c] p-3">
      <p className="text-[11px] leading-4 text-[#a2a2a2]">
        {isFinal ? "팀마다 순위를 눌러 주세요." : "이긴 팀을 눌러 주세요."} 득표는
        참고용이에요. 심사 평가와 합쳐 정한 결과를 골라 주세요.
      </p>

      <ul aria-label={`${vote.title} 결과 선택`} className="flex flex-col gap-1.5">
        {vote.participants.map((participant) => {
          const id = participant.voteParticipantId;
          const rank = selection[id];
          const votes = countOf.get(id);

          return (
            <li
              className={`flex items-center gap-2 rounded-lg border px-3 py-2 ${
                rank === 1
                  ? "border-[#00ffff] bg-[rgba(0,255,255,0.08)]"
                  : "border-[#3a3a3a]"
              }`}
              key={id}
            >
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-sm font-semibold text-[#fcfcfc]">
                  {participant.name}
                </span>
                <span className="text-[11px] text-[#a2a2a2] tabular-nums">
                  {tallies.data ? `${votes ?? 0}표 (참고)` : "득표 불러오는 중…"}
                </span>
              </div>

              {isFinal ? (
                <div
                  className="flex gap-1"
                  role="group"
                  aria-label={`${participant.name} 순위`}
                >
                  {vote.participants.map((_, index) => {
                    const value = index + 1;
                    return (
                      <button
                        aria-pressed={rank === value}
                        className={`h-9 w-11 rounded-md text-xs font-bold ${
                          rank === value
                            ? "bg-[#00ffff] text-[#0b0b0b]"
                            : "bg-[#3a3a3a] text-[#d4d4d4]"
                        }`}
                        key={value}
                        onClick={() =>
                          setSelection((prev) => assignRank(prev, id, value))
                        }
                        type="button"
                      >
                        {value}위
                      </button>
                    );
                  })}
                </div>
              ) : (
                <button
                  aria-pressed={rank === 1}
                  className={`h-9 shrink-0 rounded-md px-3 text-xs font-bold ${
                    rank === 1
                      ? "bg-[#00ffff] text-[#0b0b0b]"
                      : "bg-[#3a3a3a] text-[#d4d4d4]"
                  }`}
                  onClick={() => setSelection(pickWinner(vote, id))}
                  type="button"
                >
                  {rank === 1 ? "승리 ✓" : "이 팀 승리"}
                </button>
              )}
            </li>
          );
        })}
      </ul>

      {finalize.isError && (
        <p className="text-xs text-[#ff5b5b]" role="alert">
          {finalize.errorMessage}
        </p>
      )}
      {finalize.isSuccess && (
        <p className="text-xs text-[#7bffb0]">
          결과를 저장했어요{isFinal ? "." : ". 이긴 팀이 다음 경연으로 올라갔어요."}
        </p>
      )}

      <button
        className="h-10 rounded-lg bg-[#5d00ff] text-sm font-semibold text-[#fcfcfc] disabled:opacity-50"
        disabled={!isComplete || isSaving}
        onClick={() => setIsConfirmOpen(true)}
        type="button"
      >
        {isSaving ? "저장하는 중…" : isOpen ? "결과 확정하고 투표 마감" : "결과 확정"}
      </button>

      <ConfirmDialog
        confirmLabel={isOpen ? "확정하고 마감" : "확정"}
        description={`${describeRanking(vote, selection)}${
          isFinal ? "" : " — 1위 팀이 다음 경연으로 올라가요."
        }${isOpen ? " 투표도 함께 마감돼요." : ""}`}
        onCancel={() => setIsConfirmOpen(false)}
        onConfirm={confirm}
        open={isConfirmOpen}
        title={`${vote.title} 결과를 확정할까요?`}
      />
    </div>
  );
}
