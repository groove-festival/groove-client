import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";

import { ParticipantAvatar } from "./ParticipantAvatar";

interface VoteCompleteDialogProps {
  participantName: string;
  onClose: () => void;
}

// 투표 확인 팝업(VoteConfirmDialog)에서 "투표하기"가 성공하면 이어서 뜨는 완료 팝업.
// 같은 틀에 버튼만 "닫기" 하나로 둔다.
export function VoteCompleteDialog({
  participantName,
  onClose,
}: VoteCompleteDialogProps) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    dialogRef.current?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return createPortal(
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        aria-labelledby={titleId}
        aria-modal="true"
        className="flex flex-col items-center gap-6 rounded-[36px] bg-[rgba(252,252,252,0.5)] px-7 py-8 backdrop-blur-[4px] outline-none"
        ref={dialogRef}
        role="dialog"
        tabIndex={-1}
      >
        <p
          className="text-center text-xl leading-6 font-semibold text-[#fcfcfc]"
          id={titleId}
        >
          투표 완료!
        </p>
        <div className="flex flex-col items-center gap-4">
          <ParticipantAvatar className="size-[135px]" name={participantName} />
          <p className="text-xl leading-6 font-semibold text-[#fcfcfc]">
            {participantName}
          </p>
        </div>
        {/* 확인 팝업의 두 버튼(120px + 16px + 120px)과 같은 폭으로 길게 둔다. */}
        <button
          className="w-64 rounded-[12px] bg-[rgba(252,252,252,0.3)] px-5 py-3 text-base leading-[19px] font-semibold text-[#fcfcfc] transition-transform duration-150 ease-out active:scale-[0.97] motion-reduce:transition-none"
          onClick={onClose}
          type="button"
        >
          닫기
        </button>
      </div>
    </div>,
    document.body,
  );
}
