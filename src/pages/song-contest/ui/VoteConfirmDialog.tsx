import { useId, useRef } from "react";
import { createPortal } from "react-dom";

import { useDialogLifecycle } from "@/shared/ui";

import { ParticipantAvatar } from "./ParticipantAvatar";

interface VoteConfirmDialogProps {
  participantName: string;
  pending: boolean;

  errorMessage?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function VoteConfirmDialog({
  participantName,
  pending,
  errorMessage,
  onConfirm,
  onCancel,
}: VoteConfirmDialogProps) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);

  useDialogLifecycle({ dialogRef, onDismiss: onCancel });

  return createPortal(
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onCancel();
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
          투표하시겠어요?
        </p>
        <div className="flex flex-col items-center gap-4">
          <ParticipantAvatar className="size-[135px]" name={participantName} />
          <p className="text-xl leading-6 font-semibold text-[#fcfcfc]">
            {participantName}
          </p>
        </div>
        {errorMessage && (
          <p className="text-center text-xs text-[#ff5b5b]" role="alert">
            {errorMessage}
          </p>
        )}
        <div className="flex items-center gap-4">
          <button
            className="w-[120px] rounded-[12px] bg-[rgba(252,252,252,0.3)] px-5 py-3 text-base leading-[19px] font-semibold text-[#fcfcfc] transition-transform duration-150 ease-out active:scale-[0.97] disabled:opacity-60 disabled:active:scale-100 motion-reduce:transition-none"
            disabled={pending}
            onClick={onCancel}
            type="button"
          >
            닫기
          </button>
          <button
            className="w-[120px] rounded-[12px] bg-[#ff0080] px-5 py-3 text-base leading-[19px] font-semibold text-[#fcfcfc] transition-transform duration-150 ease-out active:scale-[0.97] disabled:opacity-60 disabled:active:scale-100 motion-reduce:transition-none"
            disabled={pending}
            onClick={onConfirm}
            type="button"
          >
            투표하기
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
