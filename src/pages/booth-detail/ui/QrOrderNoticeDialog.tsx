import { useEffect } from "react";

import qrCode from "../festival-visuals/qr-code.svg";

interface QrOrderNoticeDialogProps {
  onClose: () => void;
  onDismissPermanently: () => void;
}

export const QrOrderNoticeDialog = ({
  onClose,
  onDismissPermanently,
}: QrOrderNoticeDialogProps) => {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  return (
    <div className="fixed inset-y-0 left-1/2 z-[70] flex w-full max-w-[600px] -translate-x-1/2 items-center justify-center bg-[rgba(28,28,28,0.5)] p-4 backdrop-blur-[24px]">
      <section
        aria-labelledby="qr-order-notice-title"
        aria-modal="true"
        className="flex max-h-[calc(100dvh-32px)] w-full max-w-[320px] flex-col items-center gap-2.5 overflow-y-auto rounded-[36px] bg-[rgba(252,252,252,0.5)] px-5 py-8 backdrop-blur-[4px]"
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
              <li>주문은 주막 내 각 테이블에 비치된 QR을 통해서만 가능합니다.</li>
              <li>계좌이체 후 직원이 입금자명을 확인하면 결제가 완료 됩니다.</li>
            </ul>
          </div>

          <button
            className="h-14 w-full rounded-2xl bg-[#cfff04] text-center text-base font-semibold text-[#1c1c1c]"
            onClick={onClose}
            type="button"
          >
            확인했습니다
          </button>
        </div>

        <button
          className="text-xs leading-[14px] text-[#494949] underline underline-offset-2"
          onClick={onDismissPermanently}
          type="button"
        >
          다시 보지 않기
        </button>
      </section>
    </div>
  );
};
