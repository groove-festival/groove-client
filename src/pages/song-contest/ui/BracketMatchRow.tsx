import { Fragment } from "react";

import type { Vote } from "@/entities/contest";

import { ParticipantChip } from "./ParticipantChip";

interface BracketMatchRowProps {
  vote: Vote;

  metaLabel?: string;

  winnerDisplay?: "badge" | "color";
}

export function BracketMatchRow({
  vote,
  metaLabel,
  winnerDisplay,
}: BracketMatchRowProps) {
  const isMultiWay = vote.participants.length > 2;
  const isWinner = (resultRank: number | null) =>
    winnerDisplay !== undefined && resultRank === 1;

  return (
    <div className="flex w-full flex-col gap-3">
      <div className="flex items-center justify-between text-[#fcfcfc]">
        <p className="text-xl font-semibold">{vote.title}</p>
        {metaLabel && <p className="text-xs font-medium text-[#fcfcfc]">{metaLabel}</p>}
      </div>

      {vote.participants.length === 0 ? (
        <p className="w-full rounded-2xl border border-[#a2a2a2] bg-[#767676] p-4 text-center text-sm text-[#a2a2a2]">
          아직 참가팀이 정해지지 않았어요
        </p>
      ) : isMultiWay ? (
        <div className="flex flex-col items-center gap-2">
          {vote.participants.map((participant, index) => (
            <Fragment key={participant.voteParticipantId}>
              <div className="relative w-full">
                <ParticipantChip
                  name={participant.name}
                  winner={winnerDisplay === "color" && isWinner(participant.resultRank)}
                />
                {winnerDisplay === "badge" && isWinner(participant.resultRank) && (
                  <WinnerBadge />
                )}
              </div>
              {index < vote.participants.length - 1 && (
                <span className="text-xl font-medium text-[#fcfcfc]">vs</span>
              )}
            </Fragment>
          ))}
        </div>
      ) : (
        <div className="flex w-full items-center justify-center gap-2">
          <div className="relative min-w-0 flex-1">
            <ParticipantChip
              name={vote.participants[0].name}
              winner={
                winnerDisplay === "color" && isWinner(vote.participants[0].resultRank)
              }
            />
            {winnerDisplay === "badge" && isWinner(vote.participants[0].resultRank) && (
              <WinnerBadge />
            )}
          </div>
          <span className="shrink-0 text-xl font-medium text-[#fcfcfc]">vs</span>
          <div className="relative min-w-0 flex-1">
            <ParticipantChip
              name={vote.participants[1].name}
              winner={
                winnerDisplay === "color" && isWinner(vote.participants[1].resultRank)
              }
            />
            {winnerDisplay === "badge" && isWinner(vote.participants[1].resultRank) && (
              <WinnerBadge />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function WinnerBadge() {
  return (
    <span className="absolute -top-2 -right-2 rounded-full bg-[#ff0080] px-3 py-2 text-xs font-medium text-[#fcfcfc] shadow-[0_0_2px_#ff0080]">
      우승
    </span>
  );
}
