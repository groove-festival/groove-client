import { useId, useRef } from "react";
import { createPortal } from "react-dom";

import { warningIcon, useDialogLifecycle } from "@/shared/ui";

const guidelineEmphasisClassName = "font-black text-[#20f0f0]";

const guidelines = [
  {
    id: "request-period",
    content: (
      <>
        곡 신청은 <span className={guidelineEmphasisClassName}>사전 접수 기간</span>에만
        열립니다.
      </>
    ),
  },
  {
    id: "student-limit",
    content: (
      <>
        <span className={guidelineEmphasisClassName}>학번</span>당 최대{" "}
        <span className={guidelineEmphasisClassName}>한 곡</span>만 신청 가능합니다.
      </>
    ),
  },
  {
    id: "latest-request",
    content: "새로 신청할 경우 가장 최근에 신청하신 곡으로 갱신됩니다.",
  },
  {
    id: "festival-period",
    content: (
      <>
        신청된 곡 목록은 <span className={guidelineEmphasisClassName}>축제 기간</span>에
        확인 가능합니다.
      </>
    ),
  },
  {
    id: "searchable-track",
    content: (
      <>
        신청 시에는{" "}
        <span className={guidelineEmphasisClassName}>실제 음원이 있는 곡</span>만
        검색해서 선택할 수 있습니다.
      </>
    ),
  },
] as const;

interface SongRequestGuideModalProps {
  open: boolean;
  onClose: () => void;
}

export const SongRequestGuideModal = ({
  open,
  onClose,
}: SongRequestGuideModalProps) => {
  const titleId = useId();
  const descriptionId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const confirmButtonRef = useRef<HTMLButtonElement>(null);

  useDialogLifecycle({ dialogRef, open, onDismiss: onClose });

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
        className="font-pretendard flex w-[320px] max-w-full items-center justify-center rounded-[36px] bg-[#fcfcfc]/40 px-6 py-8 backdrop-blur-[24px] outline-none"
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
              {guidelines.map(({ content, id }) => (
                <li key={id}>{content}</li>
              ))}
            </ul>
          </div>

          <button
            className="flex h-14 items-center justify-center rounded-[12px] bg-[#5d00ff] text-base font-semibold text-[#fcfcfc] transition-transform duration-150 ease-out active:scale-[0.97] motion-reduce:transition-none"
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
