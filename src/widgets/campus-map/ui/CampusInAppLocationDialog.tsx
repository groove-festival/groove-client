import { LocateFixed, X } from "lucide-react";
import { useEffect } from "react";
import { createPortal } from "react-dom";

import { InAppBrowserNotice } from "@/shared/ui";

interface CampusInAppLocationDialogProps {
  onClose: () => void;
}

export const CampusInAppLocationDialog = ({
  onClose,
}: CampusInAppLocationDialogProps) => {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  return createPortal(
    <div className="fixed top-0 left-1/2 z-[70] flex h-dvh w-full max-w-[600px] -translate-x-1/2 items-center justify-center overflow-y-auto bg-[rgba(28,28,28,0.5)] p-4 backdrop-blur-[4px]">
      <section
        aria-labelledby="campus-in-app-location-title"
        aria-modal="true"
        className="relative flex max-h-[calc(100dvh-32px)] w-full max-w-[320px] flex-col items-center gap-8 overflow-y-auto rounded-[36px] bg-[rgba(252,252,252,0.5)] px-6 pt-[52px] pb-8 backdrop-blur-[24px]"
        role="dialog"
      >
        <button
          aria-label="안내 닫기"
          className="absolute top-7 right-7 flex size-6 items-center justify-center text-[#fcfcfc] transition-transform duration-150 ease-out active:scale-90 motion-reduce:transition-none"
          onClick={onClose}
          type="button"
        >
          <X aria-hidden="true" className="size-6" strokeWidth={1.75} />
        </button>

        <div className="flex w-full flex-col items-center gap-3 text-[#fcfcfc]">
          <LocateFixed aria-hidden="true" className="size-[72px]" strokeWidth={1.5} />
          <h1
            className="text-center text-2xl leading-[29px] font-semibold"
            id="campus-in-app-location-title"
          >
            GPS 기능 안내
          </h1>
        </div>

        <InAppBrowserNotice
          browserInstruction="크롬, 사파리등 브라우저로 접속해주세요."
          className="!rounded-none !border-0 !bg-transparent !p-0 !backdrop-blur-none"
          copyButtonClassName="!min-h-14 !bg-[#cfff04] !text-base"
          showIosSafariLocationGuide
          unavailableMessage={
            <>
              <span className="block">인스타그램, 에브리타임 인앱의 경우</span>
              <span className="block">GPS 기능을 사용할 수 없어요.</span>
            </>
          }
        />
      </section>
    </div>,
    document.body,
  );
};
