import type { Vote } from "@/entities/contest";

import { useVoteResults } from "../api/getVoteResults";

interface StageVoteResultsViewProps {
  vote: Vote;
}

export function StageVoteResultsView({ vote }: StageVoteResultsViewProps) {
  const results = useVoteResults(vote.singingVoteId);
  const countByParticipant = new Map(
    (results.data?.tallies ?? []).map((entry) => [
      entry.voteParticipantId,
      entry.voteCount,
    ]),
  );

  return (
    <div className="flex flex-col gap-1 rounded-lg bg-[#1c1c1c] p-3 text-xs">
      {results.isPending && <p className="text-[#a2a2a2]">득표 현황을 불러오는 중…</p>}
      {results.isError && (
        <p className="text-[#a2a2a2]">득표 현황을 불러오지 못했어요.</p>
      )}
      {results.data && (
        <>
          {vote.participants.map((participant) => (
            <div
              className="flex items-center justify-between"
              key={participant.voteParticipantId}
            >
              <span>{participant.name}</span>
              <span className="font-semibold">
                {countByParticipant.get(participant.voteParticipantId) ?? 0}표
              </span>
            </div>
          ))}
          <p className="mt-1 text-right text-[#a2a2a2]">
            총 {results.data.totalVotes}표 (참고용)
          </p>
        </>
      )}
    </div>
  );
}
