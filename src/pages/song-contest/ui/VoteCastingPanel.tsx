import { useEffect, useState } from "react";

import { useAuthMe, useLoginWithGoogle } from "@/entities/auth";
import { type Vote, useVotes } from "@/entities/contest";

import { useMyBallots } from "../api/getMyBallots";
import { useSubmitBallot } from "../api/submitBallot";
import { formatRemainingMinutes } from "../model/remainingMinutes";
import { useContestLocationGate } from "../model/useContestLocationGate";
import { GoogleSignInGuide } from "./GoogleSignInGuide";
import { VenueOutOfRangeNotice } from "./VenueOutOfRangeNotice";
import { VoteConfirmDialog } from "./VoteConfirmDialog";
import { VoteMatchPanel } from "./VoteMatchPanel";

type CastingTab = "cast" | "mine";

// "진행 중인 투표"/"참여한 투표" 토글 카드. 위치·로그인·선택·확정 흐름을 모두
// 여기서 관리한다.
export function VoteCastingPanel() {
  const [tab, setTab] = useState<CastingTab>("cast");
  const [now, setNow] = useState(() => new Date());
  const [selected, setSelected] = useState<Record<number, number>>({});
  const [confirmVote, setConfirmVote] = useState<Vote | undefined>();
  const [showGoogleGuide, setShowGoogleGuide] = useState(false);

  const location = useContestLocationGate();
  const auth = useAuthMe();
  const isLoggedIn = auth.data?.loggedIn === true;
  const votesQuery = useVotes();
  const myBallotsQuery = useMyBallots(isLoggedIn);
  const submitBallot = useSubmitBallot();
  const loginWithGoogle = useLoginWithGoogle();

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(interval);
  }, []);

  if (location.status === "checking") {
    return <p className="text-sm text-[#a2a2a2]">위치를 확인하는 중…</p>;
  }

  if (location.status !== "in-range") {
    return <VenueOutOfRangeNotice onRetry={location.retry} />;
  }

  const myBallotByVoteId = new Map(
    (myBallotsQuery.data ?? []).map((ballot) => [
      ballot.singingVoteId,
      ballot.voteParticipantId,
    ]),
  );

  const votes = votesQuery.data ?? [];
  const castableVotes = votes.filter(
    (vote) =>
      vote.status === "OPEN" &&
      vote.participants.length > 0 &&
      !myBallotByVoteId.has(vote.singingVoteId),
  );
  const myVotes = votes.filter((vote) => myBallotByVoteId.has(vote.singingVoteId));

  const handleSelectParticipant = (vote: Vote, voteParticipantId: number) => {
    if (!isLoggedIn) {
      setShowGoogleGuide(true);
      return;
    }
    setSelected((prev) => ({ ...prev, [vote.singingVoteId]: voteParticipantId }));
  };

  const handleConfirm = () => {
    if (!confirmVote) return;
    const voteParticipantId = selected[confirmVote.singingVoteId];
    if (voteParticipantId === undefined) return;

    submitBallot.mutate(
      {
        singingVoteId: confirmVote.singingVoteId,
        voteParticipantId,
        idempotencyKey: crypto.randomUUID(),
      },
      {
        onSuccess: () => {
          setConfirmVote(undefined);
          setSelected((prev) => {
            const next = { ...prev };
            delete next[confirmVote.singingVoteId];
            return next;
          });
        },
      },
    );
  };

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex w-full items-center justify-center gap-3">
        <button
          aria-selected={tab === "cast"}
          className={`flex-1 rounded-full px-5 py-3 text-base font-semibold ${
            tab === "cast"
              ? "bg-[rgba(255,0,128,0.8)] text-[#fcfcfc]"
              : "text-[#a2a2a2]"
          }`}
          onClick={() => setTab("cast")}
          role="tab"
          type="button"
        >
          투표하기
        </button>
        <button
          aria-selected={tab === "mine"}
          className={`flex-1 rounded-full px-5 py-3 text-base font-semibold ${
            tab === "mine"
              ? "bg-[rgba(255,0,128,0.8)] text-[#fcfcfc]"
              : "text-[#a2a2a2]"
          }`}
          onClick={() => setTab("mine")}
          role="tab"
          type="button"
        >
          참여한 투표
        </button>
      </div>

      {tab === "cast" && (
        <div className="flex w-full flex-col gap-4">
          <div>
            <p className="text-2xl font-bold text-[#fcfcfc]">진행 중인 투표</p>
            <p className="text-xs leading-[15px] text-[#cfcfcf]">
              *투표 확정 후에는 해당 경기를 중복 투표하거나 재투표할 수 없습니다
            </p>
          </div>
          {castableVotes.length === 0 ? (
            <p className="py-8 text-center text-sm text-[#a2a2a2]">
              지금 진행 중인 투표가 없어요
            </p>
          ) : (
            castableVotes.map((vote) => (
              <VoteMatchPanel
                key={vote.singingVoteId}
                onOpenConfirm={() => setConfirmVote(vote)}
                onSelectParticipant={(voteParticipantId) =>
                  handleSelectParticipant(vote, voteParticipantId)
                }
                remainingLabel={formatRemainingMinutes(vote.endsAt, now)}
                selectedParticipantId={selected[vote.singingVoteId]}
                vote={vote}
                votedParticipantId={undefined}
              />
            ))
          )}
        </div>
      )}

      {tab === "mine" &&
        (myVotes.length === 0 ? (
          <p className="w-full py-8 text-center text-sm text-[#a2a2a2]">
            아직 참여한 투표가 없어요.
          </p>
        ) : (
          <div className="flex w-full flex-col gap-4">
            {myVotes.map((vote) => (
              <VoteMatchPanel
                key={vote.singingVoteId}
                onOpenConfirm={() => {}}
                onSelectParticipant={() => {}}
                remainingLabel=""
                selectedParticipantId={undefined}
                vote={vote}
                votedParticipantId={myBallotByVoteId.get(vote.singingVoteId)}
              />
            ))}
          </div>
        ))}

      {confirmVote && selected[confirmVote.singingVoteId] !== undefined && (
        <VoteConfirmDialog
          onCancel={() => setConfirmVote(undefined)}
          onConfirm={handleConfirm}
          participantName={
            confirmVote.participants.find(
              (p) => p.voteParticipantId === selected[confirmVote.singingVoteId],
            )?.name ?? ""
          }
          pending={submitBallot.isPending}
        />
      )}

      {showGoogleGuide && (
        <GoogleSignInGuide
          onClose={() => setShowGoogleGuide(false)}
          onIdToken={(idToken) => {
            loginWithGoogle.mutate(idToken, {
              onSuccess: () => setShowGoogleGuide(false),
            });
          }}
        />
      )}
    </div>
  );
}
