import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";

export interface CompletedSong {
  title: string;
  artist?: string | null;
}

interface SongRequestCompleteModalProps {
  open: boolean;
  song: CompletedSong | null;
  // 변경: 팝업만 닫고 입력값을 유지한다.
  onChange: () => void;
  // 확인: 팝업을 닫고 폼을 초기화한다.
  onConfirm: () => void;
}

// 노래 신청 완료 팝업. Figma 805:10830.
// 표현 전용 컴포넌트로, 노출 시점은 호출부가 open으로 제어한다.
export const SongRequestCompleteModal = ({
  open,
  song,
  onChange,
  onConfirm,
}: SongRequestCompleteModalProps) => {
  const titleId = useId();
  const descriptionId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const changeButtonRef = useRef<HTMLButtonElement>(null);
  const confirmButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    const previouslyFocused = document.activeElement as HTMLElement | null;
    // 버튼이 아니라 다이얼로그 컨테이너로 포커스를 옮긴다.
    dialogRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onChange();
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      // 두 버튼 사이로 포커스를 가둔다.
      const focusables = [changeButtonRef.current, confirmButtonRef.current].filter(
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
  }, [open, onChange]);

  if (!open || !song) {
    return null;
  }

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#1c1c1c]/60 px-4"
      onClick={onChange}
    >
      <div
        aria-describedby={descriptionId}
        aria-labelledby={titleId}
        aria-modal="true"
        className="font-pretendard flex w-[320px] max-w-full items-center justify-center rounded-[36px] bg-[#fcfcfc]/40 px-8 py-9 backdrop-blur-[24px] outline-none"
        onClick={(event) => event.stopPropagation()}
        ref={dialogRef}
        role="dialog"
        tabIndex={-1}
      >
        <div className="flex w-64 flex-col gap-10">
          <div className="flex flex-col items-center gap-8">
            <h2
              className="w-full text-center text-2xl leading-[29px] font-semibold text-[#fcfcfc]"
              id={titleId}
            >
              신청이 완료되었어요!
            </h2>

            <div className="flex w-60 flex-col items-center gap-4" id={descriptionId}>
              {/* 곡 썸네일 자리. 유튜브 뮤직 연동 시 <img>로 교체한다. */}
              <div className="size-[200px] rounded-full bg-[#fcfcfc]" />
              <div className="flex flex-col items-center gap-2 text-center">
                <p className="text-xl leading-6 font-semibold text-[#fcfcfc]">
                  {song.title}
                </p>
                {/* 가수는 유튜브 뮤직 연동 전까지 디자인 placeholder를 노출한다. */}
                <p className="text-base leading-[19px] font-medium text-[#cfcfcf]">
                  {song.artist || "가수"}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              className="flex h-[43px] w-[120px] items-center justify-center rounded-[10px] bg-[#cfcfcf] px-5 text-base font-semibold text-[#767676]"
              onClick={onChange}
              ref={changeButtonRef}
              type="button"
            >
              변경
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
