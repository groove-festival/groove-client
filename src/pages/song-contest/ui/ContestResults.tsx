import type { Vote } from "@/entities/contest";

import { BracketMatchRow } from "./BracketMatchRow";

interface ContestResultsProps {
  votes: Vote[];
}

// 결과가 나온(participants 중 resultRank가 채워진) 경기만 보여준다. 준 피그마
// 프레임엔 항상 빈 상태만 있어, 실제 목록 표시는 경연 목록 카드와 같은
// BracketMatchRow를 재사용해 최소 구현했다.
export function ContestResults({ votes }: ContestResultsProps) {
  const finishedVotes = votes.filter((vote) =>
    vote.participants.some((participant) => participant.resultRank !== null),
  );

  return (
    <section
      className={`flex w-full flex-col items-start gap-6 rounded-3xl border border-[#565656] bg-[rgba(252,252,252,0.1)] px-4 ${
        finishedVotes.length === 0 ? "pt-5 pb-[51px]" : "py-5"
      }`}
    >
      <p className="text-2xl font-bold text-[#fcfcfc]">경연 결과</p>
      {finishedVotes.length === 0 ? (
        <p className="w-full text-center text-xs text-[#fcfcfc]">
          아직 완료된 경연이 없어요.
        </p>
      ) : (
        <div className="flex w-full flex-col gap-4">
          {finishedVotes.map((vote) => (
            <BracketMatchRow key={vote.singingVoteId} showWinnerBadge vote={vote} />
          ))}
        </div>
      )}
    </section>
  );
}
