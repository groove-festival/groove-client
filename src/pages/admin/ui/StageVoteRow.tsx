import { useState } from "react";

import type { Vote } from "@/entities/contest";

import { useToggleVoteStatus } from "../api/toggleVoteStatus";
import { toggleVoteStatusErrorMessage } from "../model/adminErrorMessages";
import { ConfirmDialog } from "./ConfirmDialog";
import { StageVoteResultForm } from "./StageVoteResultForm";
import { StageVoteResultsView } from "./StageVoteResultsView";

const statusLabels = { SCHEDULED: "예정", OPEN: "오픈", CLOSED: "마감" } as const;

interface StageVoteRowProps {
  vote: Vote;
}

export function StageVoteRow({ vote }: StageVoteRowProps) {
  const toggleStatus = useToggleVoteStatus();
  const [extendMinutesInput, setExtendMinutesInput] = useState("10");
  const [showResultForm, setShowResultForm] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [confirmReopen, setConfirmReopen] = useState(false);

  // 결선(3라운드)만 3자 대결이라 참가팀 3명이 다 차야 한다. 그 외에는 2명.
  // 앞 라운드 결과가 하나만 들어온 상태(예: 2명 중 1명만 채워짐)에서는
  // 아직 열 수 없다.
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
    // 이미 마감된 경기를 다시 열 때만 확인을 거친다 — 최초 오픈은 되돌릴
    // 데이터가 없어 바로 진행해도 안전하다.
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

      {!isFullyFormed && (
        <p className="text-xs text-[#a2a2a2]">
          앞 라운드 결과가 입력되면 참가팀이 자동으로 채워져요.
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
          <span className="text-xs text-[#a2a2a2]">분 뒤 마감</span>
          <button
            className="h-8 flex-1 rounded-lg bg-[#5d00ff] text-xs font-semibold text-[#fcfcfc] disabled:opacity-50"
            disabled={toggleStatus.isPending}
            onClick={onOpen}
            type="button"
          >
            {vote.status === "CLOSED" ? "경기 재오픈" : "경기 열기"}
          </button>
        </div>
      )}

      <ConfirmDialog
        description="이미 마감된 경기예요. 다시 열면 종료 시각이 새로 설정돼요."
        onCancel={() => setConfirmReopen(false)}
        onConfirm={() => {
          setConfirmReopen(false);
          openMatch();
        }}
        open={confirmReopen}
        title="경기를 다시 열까요?"
      />

      {vote.status === "OPEN" && (
        <button
          className="h-8 rounded-lg bg-[#4a4a4a] text-xs font-semibold text-[#fcfcfc] disabled:opacity-50"
          disabled={toggleStatus.isPending}
          onClick={onClose}
          type="button"
        >
          경기 마감
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
            {showResultForm ? "결과 입력 닫기" : "결과 입력"}
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
