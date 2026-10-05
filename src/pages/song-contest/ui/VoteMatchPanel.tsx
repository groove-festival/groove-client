import { Fragment } from "react";

import type { Vote } from "@/entities/contest";

import { ParticipantSelectChip } from "./ParticipantSelectChip";
import { ParticipantTile } from "./ParticipantTile";

interface VoteMatchPanelProps {
  vote: Vote;
  remainingLabel: string;

  selectedParticipantId: number | undefined;
  onSelectParticipant: (voteParticipantId: number) => void;
  onOpenConfirm: () => void;

  votedParticipantId: number | undefined;
}

export function VoteMatchPanel({
  vote,
  remainingLabel,
  selectedParticipantId,
  onSelectParticipant,
  onOpenConfirm,
  votedParticipantId,
}: VoteMatchPanelProps) {
  const isVoted = votedParticipantId !== undefined;

  const isMultiWay = vote.participants.length > 2;

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <p className="text-xl font-semibold text-[#fcfcfc]">{vote.title}</p>
          {isVoted ? (
            <span className="rounded-full bg-[#ff0080] px-3 py-2 text-xs font-medium text-[#fcfcfc] shadow-[0_0_2px_#ff0080]">
              투표 완료
            </span>
          ) : (
            <span className="text-xs font-medium text-[#fcfcfc]">{remainingLabel}</span>
          )}
        </div>

        <div
          className={
            isMultiWay
              ? "flex w-full flex-col items-center gap-2"
              : "flex w-full items-center justify-center gap-3"
          }
        >
          {vote.participants.map((participant, index) =>
            isMultiWay ? (
              <Fragment key={participant.voteParticipantId}>
                <ParticipantSelectChip
                  disabled={isVoted}
                  name={participant.name}
                  onClick={
                    isVoted
                      ? undefined
                      : () => onSelectParticipant(participant.voteParticipantId)
                  }
                  selected={
                    isVoted
                      ? votedParticipantId === participant.voteParticipantId
                      : selectedParticipantId === participant.voteParticipantId
                  }
                />
                {index < vote.participants.length - 1 && (
                  <span className="text-xl font-medium text-[#fcfcfc]">vs</span>
                )}
              </Fragment>
            ) : (
              <Fragment key={participant.voteParticipantId}>
                <ParticipantTile
                  disabled={isVoted}
                  name={participant.name}
                  onClick={
                    isVoted
                      ? undefined
                      : () => onSelectParticipant(participant.voteParticipantId)
                  }
                  selected={
                    isVoted
                      ? votedParticipantId === participant.voteParticipantId
                      : selectedParticipantId === participant.voteParticipantId
                  }
                />
                {index < vote.participants.length - 1 && (
                  <span className="shrink-0 text-xl font-semibold text-white">vs</span>
                )}
              </Fragment>
            ),
          )}
        </div>
      </div>

      {!isVoted && (
        <button
          className="h-14 w-full rounded-2xl bg-[#ff0080] text-base font-semibold text-[#fcfcfc] disabled:opacity-50"
          disabled={selectedParticipantId === undefined}
          onClick={onOpenConfirm}
          type="button"
        >
          투표하기
        </button>
      )}
    </div>
  );
}
