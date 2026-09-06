import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";

interface SongRequestOverwriteModalProps {
  open: boolean;
  // 취소: 팝업만 닫고 아무것도 제출하지 않는다.
  onCancel: () => void;
  // 확인: 기존 신청을 덮어쓴다.
  onConfirm: () => void;
}

// 같은 학번으로 이미 신청된 곡이 있을 때 뜨는 덮어쓰기 확인 팝업. Figma 805:10843.
export const SongRequestOverwriteModal = ({
  open,
  onCancel,
  onConfirm,
}: SongRequestOverwriteModalProps) => {
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  const confirmButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    const previouslyFocused = document.activeElement as HTMLElement | null;
    dialogRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onCancel();
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const focusables = [cancelButtonRef.current, confirmButtonRef.current].filter(
        (element): element is HTMLButtonElement => element !== null,
      );
      if (focusables.length === 0) {
        return;
      }

      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement;

      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      } else if (!focusables.includes(active as HTMLButtonElement)) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus();
    };
  }, [open, onCancel]);

  if (!open) {
    return null;
  }

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#1c1c1c]/60 px-4"
      onClick={onCancel}
    >
      <div
        aria-labelledby={titleId}
        aria-modal="true"
        className="font-pretendard flex w-[304px] max-w-full items-center justify-center rounded-[23px] bg-[#fcfcfc]/40 p-6 backdrop-blur-[24px] outline-none"
        onClick={(event) => event.stopPropagation()}
        ref={dialogRef}
        role="dialog"
        tabIndex={-1}
      >
        <div className="flex w-64 flex-col items-center gap-4">
          <p
            className="text-center text-xs leading-4 font-medium text-[#fcfcfc]"
            id={titleId}
          >
            이미 신청한 곡이 있어요.
            <br />
            새로운 곡으로 변경하시겠어요?
          </p>

          <div className="flex items-center gap-4">
            <button
              className="flex h-[43px] w-[120px] items-center justify-center rounded-[10px] bg-[#cfcfcf] px-5 text-base font-semibold text-[#767676]"
              onClick={onCancel}
              ref={cancelButtonRef}
              type="button"
            >
              취소
            </button>
            <button
              className="flex h-[43px] w-[120px] items-center justify-center rounded-[10px] bg-[#5d00ff] px-5 text-base font-semibold text-[#fcfcfc]"
              onClick={onConfirm}
              ref={confirmButtonRef}
              type="button"
            >
              확인
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
};
