import { type ReactNode, useEffect } from "react";

interface OrderDialogFrameProps {
  children: ReactNode;
  className: string;
  labelledBy: string;
  onClose: () => void;
}

// 주문 흐름 팝업 공통 틀. 스크롤 위치와 관계없이 지금 보고 있는 화면의
// 중앙에 뜨도록 뷰포트에 고정하고, 열려 있는 동안 뒤 화면 스크롤을 막는다.
export const OrderDialogFrame = ({
  children,
  className,
  labelledBy,
  onClose,
}: OrderDialogFrameProps) => {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  return (
    <div className="fixed top-0 left-1/2 z-[70] h-dvh w-full max-w-[600px] -translate-x-1/2 overflow-y-auto bg-[rgba(28,28,28,0.5)] backdrop-blur-[24px]">
      <div className="flex min-h-full items-center justify-center px-4 py-6">
        <section
          aria-labelledby={labelledBy}
          aria-modal="true"
          className={`bg-[rgba(252,252,252,0.5)] backdrop-blur-[4px] ${className}`}
          role="dialog"
        >
          {children}
        </section>
      </div>
    </div>
  );
};
