import { useId, useRef } from "react";
import { createPortal } from "react-dom";

import { useDialogLifecycle } from "@/shared/ui";

import type { CompletedSong } from "../model/songRequestForm";

interface SongRequestCompleteModalProps {
  open: boolean;
  song: CompletedSong | null;

  onChange: () => void;

  onConfirm: () => void;
}

export const SongRequestCompleteModal = ({
  open,
  song,
  onChange,
  onConfirm,
}: SongRequestCompleteModalProps) => {
  const titleId = useId();
  const descriptionId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  useDialogLifecycle({ dialogRef, open: open && song !== null, onDismiss: onChange });

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
        className="font-pretendard flex w-[320px] max-w-full items-center justify-center rounded-[36px] bg-[#fcfcfc]/40 px-6 py-9 backdrop-blur-[24px] outline-none"
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

            <div
              className="flex w-60 flex-col items-center gap-4"
              data-clarity-mask="true"
              id={descriptionId}
            >
              {song.albumCoverUrl ? (
                <img
                  alt=""
                  className="size-[200px] rounded-full object-cover"
                  src={song.albumCoverUrl}
                />
              ) : (
                <div className="size-[200px] rounded-full bg-[#fcfcfc]" />
              )}
              <div className="flex flex-col items-center gap-2 text-center">
                <p className="text-xl leading-6 font-semibold text-[#fcfcfc]">
                  {song.title}
                </p>
                <p className="text-base leading-[19px] font-medium text-[#cfcfcf]">
                  {song.artist || "가수"}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              className="flex h-[43px] w-[120px] items-center justify-center rounded-[12px] bg-[rgba(252,252,252,0.3)] px-5 text-base font-semibold text-[#fcfcfc] transition-transform duration-150 ease-out active:scale-[0.97] motion-reduce:transition-none"
              onClick={onChange}
              type="button"
            >
              변경
            </button>
            <button
              className="flex h-[43px] w-[120px] items-center justify-center rounded-[12px] bg-[#5d00ff] px-5 text-base font-semibold text-[#fcfcfc] transition-transform duration-150 ease-out active:scale-[0.97] motion-reduce:transition-none"
              onClick={onConfirm}
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
