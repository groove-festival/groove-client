import { useRef } from "react";

import { useDialogLifecycle } from "@/shared/ui";

import qrCode from "../festival-visuals/qr-code.svg";

interface QrOrderNoticeDialogProps {
  onClose: () => void;
  onDismissPermanently: () => void;
}

export const QrOrderNoticeDialog = ({
  onClose,
  onDismissPermanently,
}: QrOrderNoticeDialogProps) => {
  const dialogRef = useRef<HTMLElement>(null);
  useDialogLifecycle({ dialogRef, onDismiss: onClose });

  return (
    <div className="fixed top-0 left-1/2 z-[70] flex h-dvh w-full max-w-[600px] -translate-x-1/2 items-center justify-center overflow-y-auto bg-[rgba(28,28,28,0.5)] p-4 backdrop-blur-[24px]">
      <section
        aria-labelledby="qr-order-notice-title"
        aria-modal="true"
        className="flex max-h-[calc(100dvh-32px)] w-full max-w-[320px] flex-col items-center gap-4 overflow-y-auto rounded-[36px] bg-[rgba(252,252,252,0.5)] px-6 py-8 backdrop-blur-[4px]"
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
      >
        <div className="flex w-full flex-col gap-9">
          <div className="flex flex-col items-center gap-7">
            <div className="flex w-[213px] flex-col items-center gap-3">
              <img alt="" className="size-[72px]" src={qrCode} />
              <h1
                className="w-full text-center text-2xl leading-[29px] font-semibold text-[#fcfcfc]"
                id="qr-order-notice-title"
              >
                QR 셀프 주문 안내
              </h1>
            </div>

            <ul className="w-full list-disc space-y-[15px] pl-[18px] text-xs leading-[15px] text-[#fcfcfc]">
              <li>
                주문은 주막 내 각 테이블에 비치된{" "}
                <strong className="font-bold">QR을 통해서만</strong>
                <br />
                가능합니다.
              </li>
              <li>
                계좌이체는{" "}
                <strong className="font-bold">직원의 입금자명 확인 후</strong>, 현금은{" "}
                <strong className="font-bold">결제 후</strong> <br />
                조리가 시작됩니다.
              </li>
            </ul>
          </div>

          <button
            className="h-14 w-full rounded-[12px] bg-[#cfff04] text-center text-base font-semibold text-[#1c1c1c] transition-transform duration-150 ease-out active:scale-[0.97] motion-reduce:transition-none"
            onClick={onClose}
            type="button"
          >
            확인했습니다
          </button>
        </div>

        <button
          className="text-xs leading-[14px] text-[#fcfcfc] underline underline-offset-2"
          onClick={onDismissPermanently}
          type="button"
        >
          다시 보지 않기
        </button>
      </section>
    </div>
  );
};
