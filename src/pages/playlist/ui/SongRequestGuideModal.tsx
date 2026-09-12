import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";

import warningIcon from "../festival-visuals/warning.svg";

// 유의사항 안내 문구. Figma 805:10865의 순서를 그대로 따른다.
const guidelines = [
  "곡 신청은 사전 접수 기간에만 열립니다.",
  "학번당 최대 한 곡만 신청 가능합니다.",
  "새로 신청할 경우 가장 최근에 신청하신 곡으로 갱신됩니다.",
  "신청된 곡 목록은 축제 기간에 확인 가능합니다.",
  "신청 시에는 실제 음원이 있는 곡만 검색해서 선택할 수 있습니다.",
] as const;

interface SongRequestGuideModalProps {
  open: boolean;
  onClose: () => void;
}

// GROOVE PLAYLIST 신청 유의 사항 팝업. Figma 805:10857.
// 표현 전용 컴포넌트로, 노출 시점은 호출부가 open으로 제어한다.
export const SongRequestGuideModal = ({
  open,
  onClose,
}: SongRequestGuideModalProps) => {
  const titleId = useId();
  const descriptionId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const confirmButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    const previouslyFocused = document.activeElement as HTMLElement | null;
    // 확인 버튼이 눌린 것처럼 보이지 않도록, 포커스는 버튼이 아니라
    // 다이얼로그 컨테이너로 옮긴다. 포커스는 여전히 모달 안에 갇힌다.
    dialogRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }

      // 확인 버튼 하나뿐이므로 Tab 이동을 그 버튼으로 가둔다.
      if (event.key === "Tab") {
        event.preventDefault();
        confirmButtonRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus({ preventScroll: true });
    };
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#1c1c1c]/60 px-4"
      onClick={onClose}
    >
      <div
        aria-describedby={descriptionId}
        aria-labelledby={titleId}
        aria-modal="true"
        className="font-pretendard flex w-[320px] max-w-full items-center justify-center rounded-[36px] bg-[#fcfcfc]/40 p-8 backdrop-blur-[24px] outline-none"
        onClick={(event) => event.stopPropagation()}
        ref={dialogRef}
        role="dialog"
        tabIndex={-1}
      >
        <div className="flex w-64 flex-col gap-9">
          <div className="flex flex-col items-center gap-7">
            <div className="flex w-[213px] flex-col items-center gap-3">
              <img alt="" className="size-20" src={warningIcon} />
              <h2
                className="text-center text-2xl leading-[29px] font-semibold text-[#fcfcfc]"
                id={titleId}
              >
                GROOVE PLAYLIST
                <br />
                신청 유의 사항
              </h2>
            </div>

            <ul
              className="w-[244px] list-disc space-y-[15px] ps-[18px] text-xs leading-[15px] break-keep text-[#fcfcfc]"
              id={descriptionId}
            >
              {guidelines.map((guideline) => (
                <li key={guideline}>{guideline}</li>
              ))}
            </ul>
          </div>

          <button
            className="flex h-14 items-center justify-center rounded-2xl bg-[#5d00ff] text-base font-semibold text-[#fcfcfc]"
            onClick={onClose}
            ref={confirmButtonRef}
            type="button"
          >
            확인했습니다
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};
