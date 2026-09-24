import { Copy } from "lucide-react";
import { useState } from "react";

import {
  ACCOUNT_NUMBER_COPIED_MESSAGE,
  ACCOUNT_NUMBER_COPY_FAILED_MESSAGE,
} from "../config/copyMessages";
import { createToast, type ToastState } from "../model/toast";
import { OrderToast } from "./OrderToast";

interface CopyAccountNumberButtonProps {
  accountNumber: string;
  className?: string;
}

// 계좌번호 뒤에 붙는 작은 복사 버튼. 누르면 결과를 화면 하단 토스트로 잠깐
// 보여주고 스크린리더에도 알린다.
export const CopyAccountNumberButton = ({
  accountNumber,
  className = "",
}: CopyAccountNumberButtonProps) => {
  const [toast, setToast] = useState<ToastState | null>(null);

  const copyAccountNumber = async () => {
    let message = ACCOUNT_NUMBER_COPIED_MESSAGE;

    try {
      await navigator.clipboard.writeText(accountNumber);
    } catch {
      message = ACCOUNT_NUMBER_COPY_FAILED_MESSAGE;
    }

    setToast(createToast(message));
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
      <OrderToast onDismiss={() => setToast(null)} toast={toast} />
    </>
  );
};
