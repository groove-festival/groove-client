import { InAppBrowserNotice } from "@/shared/ui";

import { formatRemainingMinutes } from "../model/remainingMinutes";
import { useVoteCasting } from "../model/useVoteCasting";
import { GoogleSignInGuide } from "./GoogleSignInGuide";
import { VoteCompleteDialog } from "./VoteCompleteDialog";
import { VoteConfirmDialog } from "./VoteConfirmDialog";
import { VoteLocationFindingOverlay } from "./VoteLocationFindingOverlay";
import { VoteLocationNotice } from "./VoteLocationNotice";
import { VoteMatchPanel } from "./VoteMatchPanel";

export function VoteCastingPanel() {
  const {
    tab,
    setTab,
    now,
    selected,
    confirmVote,
    completedParticipantName,
    showGoogleGuide,
    restrictedInAppBrowser,
    safariBrowser,
    location,
    castableVotes,
    myVotes,
    myBallotByVoteId,
    voteErrorMessage,
    isSubmitting,
    isLoginPending,
    loginErrorMessage,
    handleSelectParticipant,
    handleConfirm,
    openConfirm,
    closeConfirm,
    closeCompleted,
    closeGoogleGuide,
    handleGoogleCredential,
  } = useVoteCasting();
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
            <div aria-hidden="true" className="h-[260px] w-full" />
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
                  onOpenConfirm={() => openConfirm(vote)}
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
          errorMessage={voteErrorMessage}
          onCancel={closeConfirm}
          onConfirm={handleConfirm}
          participantName={
            confirmVote.participants.find(
              (p) => p.voteParticipantId === selected[confirmVote.singingVoteId],
            )?.name ?? ""
          }
          pending={isSubmitting}
        />
      )}

      {completedParticipantName !== undefined && (
        <VoteCompleteDialog
          onClose={closeCompleted}
          participantName={completedParticipantName}
        />
      )}

      {tab === "cast" &&
        restrictedInAppBrowser === null &&
        location.status === "checking" && <VoteLocationFindingOverlay />}

      {showGoogleGuide && (
        <GoogleSignInGuide
          onClose={closeGoogleGuide}
          onIdToken={handleGoogleCredential}
          pending={isLoginPending}
          errorMessage={loginErrorMessage}
        />
      )}
    </div>
  );
}
