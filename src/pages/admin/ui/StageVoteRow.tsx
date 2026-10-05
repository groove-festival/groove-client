import { useState } from "react";

import type { Vote } from "@/entities/contest";

import { useToggleVoteStatus } from "../api/toggleVoteStatus";
import { toggleVoteStatusErrorMessage } from "../model/adminErrorMessages";
import { ConfirmDialog } from "./ConfirmDialog";
import { StageVoteResultForm } from "./StageVoteResultForm";
import { StageVoteResultsView } from "./StageVoteResultsView";

const statusLabels = {
  SCHEDULED: "투표 전",
  OPEN: "투표 중",
  CLOSED: "투표 마감",
} as const;

interface StageVoteRowProps {
  vote: Vote;
}

export function StageVoteRow({ vote }: StageVoteRowProps) {
  const toggleStatus = useToggleVoteStatus();
  const [extendMinutesInput, setExtendMinutesInput] = useState("5");

  const hasResult = vote.participants.some(
    (participant) => participant.resultRank !== null,
  );
  const [showResultForm, setShowResultForm] = useState(
    vote.status === "CLOSED" && !hasResult,
  );
  const [showResults, setShowResults] = useState(false);
  const [confirmReopen, setConfirmReopen] = useState(false);

  const expectedParticipantCount = vote.round === "ROUND_3" ? 3 : 2;
  const isFullyFormed = vote.participants.length >= expectedParticipantCount;

  const openMatch = () => {
    const minutes = Number(extendMinutesInput);
    if (!Number.isInteger(minutes) || minutes < 1) return;
    toggleStatus.mutate({
      singingVoteId: vote.singingVoteId,
      status: "OPEN",
      extendMinutes: minutes,
    });
  };

  const onOpen = () => {
    if (vote.status === "CLOSED") {
      setConfirmReopen(true);
      return;
    }
    openMatch();
  };

  const onClose = () => {
    toggleStatus.mutate({ singingVoteId: vote.singingVoteId, status: "CLOSED" });
  };

  return (
    <div className="flex flex-col gap-2 rounded-lg bg-[#3a3a3a] p-3">
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <p className="text-sm font-semibold text-[#fcfcfc]">{vote.title}</p>
          <p className="text-[10px] text-[#a2a2a2]">
            {vote.roundLabel} · {statusLabels[vote.status]}
          </p>
        </div>
        <p className="text-xs text-[#a2a2a2]">
          {vote.participants.map((participant) => participant.name).join(", ") ||
            "참가팀 미정"}
        </p>
      </div>

      {hasResult && (
        <p className="text-xs font-semibold text-[#00ffff]">
          결과:{" "}
          {[...vote.participants]
            .filter((participant) => participant.resultRank !== null)
            .sort((left, right) => (left.resultRank ?? 0) - (right.resultRank ?? 0))
            .map((participant) => `${participant.resultRank}위 ${participant.name}`)
            .join(" · ")}
        </p>
      )}

      {!isFullyFormed && (
        <p className="text-xs text-[#a2a2a2]">
          앞 라운드 결과가 입력되면 참가팀이 자동으로 채워져요.
        </p>
      )}

      {isFullyFormed && vote.status === "SCHEDULED" && (
        <p className="text-xs text-[#a2a2a2]">
          참가팀 공연이 모두 끝나면 투표를 시작해 주세요. 누르는 순간부터 관객 투표를
          받고, 적은 시간이 지나면 자동으로 마감돼요.
        </p>
      )}

      {isFullyFormed && vote.status !== "OPEN" && (
        <div className="flex items-center gap-2">
          <input
            className="h-8 w-16 rounded-md border border-[#5d5d5d] bg-[#323232] px-2 text-center text-sm text-[#fcfcfc] outline-none focus:border-[#00ffff]"
            inputMode="numeric"
            onChange={(event) => setExtendMinutesInput(event.target.value)}
            value={extendMinutesInput}
          />
          <span className="text-xs text-[#a2a2a2]">분 동안</span>
          <button
            className="h-8 flex-1 rounded-lg bg-[#5d00ff] text-xs font-semibold text-[#fcfcfc] disabled:opacity-50"
            disabled={toggleStatus.isPending}
            onClick={onOpen}
            type="button"
          >
            {vote.status === "CLOSED" ? "투표 다시 열기" : "투표 시작"}
          </button>
        </div>
      )}

      <ConfirmDialog
        description="이미 마감된 투표예요. 다시 열면 지금부터 적은 시간 동안 다시 표를 받아요."
        onCancel={() => setConfirmReopen(false)}
        onConfirm={() => {
          setConfirmReopen(false);
          openMatch();
        }}
        open={confirmReopen}
        title="투표를 다시 열까요?"
      />

      {vote.status === "OPEN" && (
        <button
          className="h-8 rounded-lg bg-[#4a4a4a] text-xs font-semibold text-[#fcfcfc] disabled:opacity-50"
          disabled={toggleStatus.isPending}
          onClick={onClose}
          type="button"
        >
          투표 마감
        </button>
      )}

      {toggleStatus.isError && (
        <p className="text-xs text-[#ff5b5b]">
          {toggleVoteStatusErrorMessage(toggleStatus.error)}
        </p>
      )}

      {isFullyFormed && (
        <div className="flex gap-2">
          <button
            className="h-8 flex-1 rounded-lg border border-[#5d5d5d] text-xs font-semibold text-[#fcfcfc]"
            onClick={() => setShowResultForm((prev) => !prev)}
            type="button"
          >
            {showResultForm ? "결과 입력 닫기" : hasResult ? "결과 수정" : "결과 입력"}
          </button>
          <button
            className="h-8 flex-1 rounded-lg border border-[#5d5d5d] text-xs font-semibold text-[#fcfcfc]"
            onClick={() => setShowResults((prev) => !prev)}
            type="button"
          >
            {showResults ? "득표 닫기" : "득표 보기"}
          </button>
        </div>
      )}

      {showResultForm && <StageVoteResultForm vote={vote} />}
      {showResults && <StageVoteResultsView vote={vote} />}
    </div>
  );
}
