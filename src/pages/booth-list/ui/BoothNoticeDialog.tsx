import { useEffect } from "react";

import cheersIcon from "../festival-visuals/cheers.svg";

interface BoothNoticeDialogProps {
  onClose: () => void;
  onDismissPermanently: () => void;
}

export const BoothNoticeDialog = ({
  onClose,
  onDismissPermanently,
}: BoothNoticeDialogProps) => {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  return (
    <div className="fixed top-0 left-1/2 z-[70] flex h-dvh w-full max-w-[600px] -translate-x-1/2 items-center justify-center overflow-y-auto bg-[rgba(28,28,28,0.5)] p-4 backdrop-blur-[4px]">
      <section
        aria-labelledby="booth-notice-title"
        aria-modal="true"
        className="flex max-h-[calc(100dvh-32px)] w-full max-w-[320px] flex-col items-center gap-4 overflow-y-auto rounded-[36px] bg-[rgba(252,252,252,0.5)] px-6 py-8 backdrop-blur-[24px]"
        role="dialog"
      >
        <div className="flex w-full flex-col gap-8">
          <div className="flex flex-col items-center gap-7 text-[#fcfcfc]">
            <div className="flex flex-col items-center gap-3">
              <img alt="" className="size-20" src={cheersIcon} />
              <h1
                className="text-center text-2xl leading-[29px] font-semibold"
                id="booth-notice-title"
              >
                주막 이용 안내 사항
              </h1>
            </div>

            <ul className="w-full list-disc space-y-[15px] pl-[18px] text-xs leading-[15px]">
              {/* 줄바꿈은 <br />, 강조는 <strong className="font-bold">…</strong> */}
              <li>
                주막에서는{" "}
                <strong className="font-bold">주류를 판매하지 않습니다.</strong>
                <br />
                주류는 <strong className="font-bold">외부에서 직접 지참</strong>해
                이용해 주시기 바랍니다.
              </li>
              <li>
                타인에게 피해를 주는 행위 또는 과음으로 인한 소란 시<br />
                <strong className="font-bold">퇴장 조치</strong>될 수 있습니다.
              </li>
              <li>
                지나친 음주로 인한 사고의 책임은{" "}
                <strong className="font-bold">당사자</strong>에게 있으니
                <br />
                안전에 유의 바랍니다.
              </li>
              <li>
                결제는 <strong className="font-bold">계좌이체 또는 현금 결제</strong>로
                이루어집니다.
              </li>
              <li>
                주문은{" "}
                <strong className="font-bold">
                  [메뉴 담기 → 계좌이체/현금 결제 → 결제 완료
                  <br />→ 조리 시작]
                </strong>{" "}
                순으로 진행됩니다.
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
