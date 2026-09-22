import { Copy } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import {
  ACCOUNT_NUMBER_COPIED_MESSAGE,
  ACCOUNT_NUMBER_COPY_FAILED_MESSAGE,
  COPY_TOAST_DURATION_MS,
} from "../config/copyMessages";

interface CopyAccountNumberButtonProps {
  accountNumber: string;
  className?: string;
}

// 계좌번호 뒤에 붙는 작은 복사 버튼. 누르면 결과를 화면 하단 토스트로 잠깐
// 보여주고 스크린리더에도 알린다. 팝업의 transform·backdrop-filter가 fixed
// 위치의 기준이 되지 않도록 토스트는 body로 포털한다.
export const CopyAccountNumberButton = ({
  accountNumber,
  className = "",
}: CopyAccountNumberButtonProps) => {
  const [toast, setToast] = useState<{ id: number; message: string } | null>(null);

  useEffect(() => {
    if (!toast) {
      return;
    }

    const timeoutId = window.setTimeout(() => setToast(null), COPY_TOAST_DURATION_MS);
    return () => window.clearTimeout(timeoutId);
  }, [toast]);

  const copyAccountNumber = async () => {
    let message = ACCOUNT_NUMBER_COPIED_MESSAGE;

    try {
      await navigator.clipboard.writeText(accountNumber);
    } catch {
      message = ACCOUNT_NUMBER_COPY_FAILED_MESSAGE;
    }

    // 같은 문구로 다시 눌러도 표시 시간이 새로 시작되도록 id를 바꾼다.
    setToast({ id: Date.now(), message });
  };

  return (
    <>
      <button
        aria-label="계좌번호 복사"
        className={`inline-flex size-4 shrink-0 items-center justify-center ${className}`}
        onClick={copyAccountNumber}
        type="button"
      >
        <Copy aria-hidden="true" className="size-3.5" strokeWidth={2} />
      </button>
      {createPortal(
        <div
          aria-live="polite"
          className="pointer-events-none fixed bottom-32 left-1/2 z-[80] -translate-x-1/2"
          role="status"
        >
          {toast && (
            <p
              className="rounded-full bg-[rgba(28,28,28,0.9)] px-4 py-2.5 text-sm leading-[17px] font-medium whitespace-nowrap text-[#fcfcfc] shadow-[0_4px_16px_rgba(0,0,0,0.3)]"
              key={toast.id}
            >
              {toast.message}
            </p>
          )}
        </div>,
        document.body,
      )}
    </>
  );
};
