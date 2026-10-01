import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import { isGoogleParticipant, useAuthMe, useLoginWithGoogle } from "@/entities/auth";
import { contestQueryKeys, type Vote, useVotes } from "@/entities/contest";
import {
  getIsSafariBrowser,
  getRestrictedInAppBrowser,
} from "@/shared/lib/in-app-browser";
import { InAppBrowserNotice } from "@/shared/ui";

import { useMyBallots } from "../api/getMyBallots";
import { songContestQueryKeys } from "../api/queryKeys";
import { useSubmitBallot } from "../api/submitBallot";
import { formatRemainingMinutes } from "../model/remainingMinutes";
import { submitBallotErrorMessage } from "../model/submitBallotErrorMessage";
import { useContestLocationGate } from "../model/useContestLocationGate";
import { GoogleSignInGuide } from "./GoogleSignInGuide";
import { VoteCompleteDialog } from "./VoteCompleteDialog";
import { VoteConfirmDialog } from "./VoteConfirmDialog";
import { VoteLocationNotice } from "./VoteLocationNotice";
import { VoteMatchPanel } from "./VoteMatchPanel";

type CastingTab = "cast" | "mine";

// "진행 중인 투표"/"참여한 투표" 토글 카드. 위치·로그인·선택·확정 흐름을 모두
// 여기서 관리한다.
export function VoteCastingPanel() {
  const [tab, setTab] = useState<CastingTab>("cast");
  const [now, setNow] = useState(() => new Date());
  const [selected, setSelected] = useState<Record<number, number>>({});
  const [confirmVote, setConfirmVote] = useState<Vote | undefined>();
  // 투표가 들어간 참가자 이름. 있으면 완료 팝업을 띄운다.
  const [completedParticipantName, setCompletedParticipantName] = useState<
    string | undefined
  >();
  const [showGoogleGuide, setShowGoogleGuide] = useState(false);
  const [pendingSelection, setPendingSelection] = useState<
    { vote: Vote; voteParticipantId: number } | undefined
  >();
  const [restrictedInAppBrowser] = useState(() => getRestrictedInAppBrowser());
  const [safariBrowser] = useState(getIsSafariBrowser);

  const queryClient = useQueryClient();
  const location = useContestLocationGate(restrictedInAppBrowser === null);
  const auth = useAuthMe();
  // loggedIn만 보면 관리자(STAGE_ADMIN 등) 세션도 로그인된 것으로 잘못
  // 인식한다 — 투표에 필요한 건 구글 참여자(role: USER) 세션이다.
  const isLoggedIn = isGoogleParticipant(auth.data);
  const votesQuery = useVotes();
  const myBallotsQuery = useMyBallots(isLoggedIn);
  const submitBallot = useSubmitBallot();
  const loginWithGoogle = useLoginWithGoogle();

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(interval);
  }, []);

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

  // 비로그인 상태일 때만 안내 팝업을 보여준다 — 이미 구글 로그인이 된
  // 뒤에는 투표할 때마다 매번 띄울 필요가 없다.
  const handleSelectParticipant = (vote: Vote, voteParticipantId: number) => {
    if (!isLoggedIn) {
      setPendingSelection({ vote, voteParticipantId });
      setShowGoogleGuide(true);
      return;
    }
    setSelected((prev) => ({ ...prev, [vote.singingVoteId]: voteParticipantId }));
  };

  const applyPendingSelection = () => {
    if (!pendingSelection) return;
    setSelected((prev) => ({
      ...prev,
      [pendingSelection.vote.singingVoteId]: pendingSelection.voteParticipantId,
    }));
    setPendingSelection(undefined);
    setShowGoogleGuide(false);
  };

  const handleConfirm = () => {
    if (!confirmVote) return;
    const voteParticipantId = selected[confirmVote.singingVoteId];
    if (voteParticipantId === undefined) return;
    const participantName =
      confirmVote.participants.find((p) => p.voteParticipantId === voteParticipantId)
        ?.name ?? "";

    submitBallot.mutate(
      {
        singingVoteId: confirmVote.singingVoteId,
        voteParticipantId,
        idempotencyKey: crypto.randomUUID(),
      },
      {
        onSuccess: () => {
          setConfirmVote(undefined);
          setCompletedParticipantName(participantName);
          setSelected((prev) => {
            const next = { ...prev };
            delete next[confirmVote.singingVoteId];
            return next;
          });
        },
        // 마감·중복 투표처럼 이 화면이 들고 있던 상태가 이미 낡아서 실패하는
        // 경우가 대부분이라, 팝업은 열어둔 채 최신 목록을 다시 받아온다.
        onError: () => {
          void queryClient.invalidateQueries({ queryKey: contestQueryKeys.votes() });
          void queryClient.invalidateQueries({
            queryKey: songContestQueryKeys.myBallots(),
          });
        },
      },
    );
  };

  return (
    <div className="flex w-full flex-col gap-6 rounded-3xl border border-[#565656] bg-[rgba(252,252,252,0.1)] px-3 py-4">
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
        <div className="flex w-full flex-col items-center gap-4">
          <div className="flex w-full flex-col gap-3">
            <p className="text-2xl font-bold text-[#fcfcfc]">진행 중인 투표</p>
            <p className="text-xs leading-[15px] text-[#cfcfcf]">
              *투표 확정 후에는 해당 경연을 중복 투표하거나 재투표할 수 없습니다
            </p>
          </div>
          {restrictedInAppBrowser ? (
            <InAppBrowserNotice
              browserInstruction="크롬, 사파리등 브라우저로 접속해주세요."
              showIosSafariLocationGuide
              unavailableMessage={
                <>
                  <span className="block">인스타그램, 에브리타임 인앱에서는</span>
                  <span className="block">GPS와 Google 로그인을 사용할 수 없어</span>
                  <span className="block">투표할 수 없어요.</span>
                </>
              }
            />
          ) : location.status === "checking" ? (
            <p className="py-8 text-center text-sm text-[#a2a2a2]">
              위치를 확인하는 중…
            </p>
          ) : location.status !== "in-range" ? (
            <VoteLocationNotice
              onRetry={location.retry}
              showSafariPermissionGuide={safariBrowser}
              status={location.status}
            />
          ) : castableVotes.length === 0 ? (
            <p className="py-8 text-center text-sm text-[#a2a2a2]">
              지금 진행 중인 투표가 없어요
            </p>
          ) : (
            <div className="flex w-full flex-col gap-4">
              {castableVotes.map((vote) => (
                <VoteMatchPanel
                  key={vote.singingVoteId}
                  onOpenConfirm={() => {
                    submitBallot.reset();
                    setConfirmVote(vote);
                  }}
                  onSelectParticipant={(voteParticipantId) =>
                    handleSelectParticipant(vote, voteParticipantId)
                  }
                  remainingLabel={formatRemainingMinutes(vote.endsAt, now)}
                  selectedParticipantId={selected[vote.singingVoteId]}
                  vote={vote}
                  votedParticipantId={undefined}
                />
              ))}
            </div>
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
          errorMessage={
            submitBallot.isError
              ? submitBallotErrorMessage(submitBallot.error)
              : undefined
          }
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

      {completedParticipantName !== undefined && (
        <VoteCompleteDialog
          onClose={() => setCompletedParticipantName(undefined)}
          participantName={completedParticipantName}
        />
      )}

      {showGoogleGuide && (
        <GoogleSignInGuide
          onClose={() => {
            setShowGoogleGuide(false);
            setPendingSelection(undefined);
          }}
          onIdToken={(idToken) => {
            loginWithGoogle.mutate(idToken, {
              onSuccess: applyPendingSelection,
            });
          }}
        />
      )}
    </div>
  );
}
