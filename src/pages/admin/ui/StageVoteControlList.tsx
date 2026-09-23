import { useVotes } from "@/entities/contest";

import { StageVoteRow } from "./StageVoteRow";

export function StageVoteControlList() {
  const votes = useVotes();

  return (
    <section className="flex flex-col gap-3 rounded-2xl bg-[#262626] p-4">
      <h2 className="text-sm font-bold text-[#fcfcfc]">경연 대진표</h2>

      {votes.isPending && (
        <p className="text-xs text-[#a2a2a2]">대진표를 불러오는 중…</p>
      )}
      {votes.isError && (
        <p className="text-xs text-[#a2a2a2]">대진표를 불러오지 못했어요.</p>
      )}

      {votes.data && (
        <div className="flex flex-col gap-2">
          {votes.data.map((vote) => (
            <StageVoteRow key={vote.singingVoteId} vote={vote} />
          ))}
        </div>
      )}
    </section>
  );
}
