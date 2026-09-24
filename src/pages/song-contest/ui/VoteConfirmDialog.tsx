import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";

interface VoteConfirmDialogProps {
  participantName: string;
  pending: boolean;
  // 마감·중복 투표 등으로 제출이 실패했을 때만 채워진다.
  errorMessage?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

// 참가자 선택 후 "투표하기"를 눌렀을 때 뜨는 최종 확인 팝업 (node 1441:15595,
// 레이어명 "투표 확인 버튼"). 확정 후에는 수정·재투표가 불가하다.
export function VoteConfirmDialog({
  participantName,
  pending,
  errorMessage,
  onConfirm,
  onCancel,
}: VoteConfirmDialogProps) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    dialogRef.current?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCancel();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onCancel]);

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
        className="flex flex-col items-center gap-9 rounded-[36px] bg-[#fcfcfc]/50 px-7 py-8 backdrop-blur-xl outline-none"
        ref={dialogRef}
        role="dialog"
        tabIndex={-1}
      >
        <div className="flex w-[256px] flex-col items-center gap-7">
          <p className="text-2xl font-semibold text-[#fcfcfc]" id={titleId}>
            투표 완료!
          </p>
          <div className="flex flex-col items-center gap-4">
            <span
              aria-hidden="true"
              className="size-[135px] shrink-0 rounded-full bg-[#fcfcfc]"
            />
            <p className="text-xl font-semibold text-[#fcfcfc]">{participantName}</p>
          </div>
          {errorMessage && (
            <p className="text-center text-xs text-[#ff5b5b]" role="alert">
              {errorMessage}
            </p>
          )}
        </div>
        <div className="flex items-center gap-4">
          <button
            className="w-[120px] rounded-[10px] bg-[#cfcfcf] px-5 py-3 text-base font-semibold text-[#767676] disabled:opacity-60"
            disabled={pending}
            onClick={onCancel}
            type="button"
          >
            변경
          </button>
          <button
            className="w-[120px] rounded-[10px] bg-[#d50970] px-5 py-3 text-base font-semibold text-[#fcfcfc] disabled:opacity-60"
            disabled={pending}
            onClick={onConfirm}
            type="button"
          >
            확인
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
