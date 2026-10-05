import { type ReactNode, useState } from "react";

import { useVotes } from "@/entities/contest";
import { useFestivalStatus } from "@/entities/festival";
import { useScheduledRefetch } from "@/shared/lib/scheduling";
import { LoadingFallback, NetworkErrorFallback } from "@/shared/ui";

import { nextContestBoundaryAt } from "../model/nextContestBoundaryAt";
import { formatRemainingMinutes } from "../model/remainingMinutes";
import { type ContestOverviewTab } from "../model/useContestOverview";
import { BracketMatchRow } from "./BracketMatchRow";
import { ContestBeforeNotice } from "./ContestBeforeNotice";
import { ContestClosedNotice } from "./ContestClosedNotice";
import { ContestOverview } from "./ContestOverview";
import { ContestResults } from "./ContestResults";
import { VoteCastingPanel } from "./VoteCastingPanel";

export default function SongContestPage() {
  const status = useFestivalStatus();
  const contestPhase = status.data?.stage.contestPhase;
  const votesQuery = useVotes();
  const votes = votesQuery.data ?? [];
  const [tab, setTab] = useState<ContestOverviewTab>("timetable");

  useScheduledRefetch(
    status.data ? nextContestBoundaryAt(contestPhase, status.data.stage) : undefined,
    status.refetch,
  );

  if (!contestPhase && status.isPending) {
    return <LoadingFallback />;
  }

  if (!contestPhase && status.isError) {
    return <NetworkErrorFallback />;
  }

  const votesTabLabel = contestPhase === "CLOSED" ? "경연 결과" : "경연 목록";
  const votesTabContent: ReactNode =
    status.isPending || votesQuery.isPending ? (
      <p className="pt-32 text-center text-base text-[#a2a2a2]">불러오는 중…</p>
    ) : status.isError || votesQuery.isError ? (
      <p className="pt-32 text-center text-base text-[#a2a2a2]">
        경연 목록을 불러오지 못했어요.
      </p>
    ) : votes.length === 0 ? (
      <p className="pt-32 text-center text-base">아직 대진표가 공개되지 않았어요</p>
    ) : (
      <ol className="space-y-5">
        {votes.map((vote) => (
          <li key={vote.singingVoteId}>
            <BracketMatchRow
              metaLabel={
                vote.status === "OPEN"
                  ? formatRemainingMinutes(vote.endsAt, new Date())
                  : undefined
              }
              vote={vote}
              winnerDisplay={contestPhase === "CLOSED" ? "color" : undefined}
            />
          </li>
        ))}
      </ol>
    );

  return (
    <main className="relative min-h-[calc(100dvh-64px)] w-full bg-[#1c1c1c] px-4 pb-20 text-[#fcfcfc]">
      <ContestOverview
        onTabChange={setTab}
        tab={tab}
        votesTabContent={votesTabContent}
        votesTabLabel={votesTabLabel}
      />

      {contestPhase === "BEFORE" && <ContestBeforeNotice />}
      {contestPhase === "CLOSED" && <ContestClosedNotice />}
      {contestPhase === "OPEN" && (
        <div className="mx-auto mt-10 flex w-full flex-col gap-6">
          <VoteCastingPanel />
          <ContestResults votes={votes} />
        </div>
      )}
    </main>
  );
}
