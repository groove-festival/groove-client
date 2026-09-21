import { useEffect } from "react";

import cheersIcon from "../festival-visuals/cheers.svg";

interface BoothNoticeDialogProps {
  onClose: () => void;
  onDismissPermanently: () => void;
}

const noticeItems = [
  "주막 내 주류 판매는 하지 않고 있습니다. 따라서 외부에서 직접 지참 후 이용해 주시기 바랍니다.",
  "타인에게 피해를 주는 행위나 과음으로 인한 소란 시 퇴장 조치될 수 있습니다.",
  "지나친 음주로 인한 사고 책임은 당사자에게 있으니 안전에 유의 바랍니다.",
  "결제는 계좌이체로 이루어집니다.",
  "주문은 [메뉴 담기 → 계좌이체 → 입금자명 확인 → 결제 완료 → 조리 시작] 순으로 진행됩니다.",
];

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
    <div className="absolute inset-0 z-40 bg-[rgba(28,28,28,0.5)] backdrop-blur-[4px]">
      <section
        aria-labelledby="booth-notice-title"
        aria-modal="true"
        className="absolute top-[179px] left-1/2 flex w-80 -translate-x-1/2 flex-col items-center gap-2.5 rounded-[36px] bg-[rgba(252,252,252,0.5)] px-7 py-8 backdrop-blur-[24px]"
        role="dialog"
      >
        <div className="flex w-64 flex-col gap-10">
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

            <ul className="w-[244px] list-disc space-y-[15px] pl-[18px] text-xs leading-[15px]">
              {noticeItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
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
