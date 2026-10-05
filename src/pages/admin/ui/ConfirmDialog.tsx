import { useId, useRef } from "react";
import { createPortal } from "react-dom";

import { useDialogLifecycle } from "@/shared/ui";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;

  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog = ({
  open,
  title,
  description,
  confirmLabel = "확인",
  danger = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) => {
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);

  useDialogLifecycle({ dialogRef, open, onDismiss: onCancel });

  if (!open) {
    return null;
  }

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
      onClick={onCancel}
    >
      <div
        aria-labelledby={titleId}
        aria-modal="true"
        className="font-pretendard flex w-[300px] max-w-full flex-col gap-4 rounded-2xl bg-[#323232] p-5 outline-none"
        onClick={(event) => event.stopPropagation()}
        ref={dialogRef}
        role="dialog"
        tabIndex={-1}
      >
        <div className="flex flex-col gap-1.5">
          <p className="text-sm font-semibold text-[#fcfcfc]" id={titleId}>
            {title}
          </p>
          {description && (
            <p className="text-xs leading-4 text-[#a2a2a2]">{description}</p>
          )}
        </div>
        <div className="flex justify-end gap-2">
          <button
            className="h-9 rounded-lg bg-[#4a4a4a] px-4 text-xs font-semibold text-[#fcfcfc]"
            onClick={onCancel}
            type="button"
          >
            취소
          </button>
          <button
            className={`h-9 rounded-lg px-4 text-xs font-semibold text-[#fcfcfc] ${
              danger ? "bg-[#ff5b5b]" : "bg-[#5d00ff]"
            }`}
            onClick={onConfirm}
            type="button"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};
