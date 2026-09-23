import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

import { TOAST_DURATION_MS } from "../config/copyMessages";
import { type ToastState } from "../model/toast";

interface OrderToastProps {
  onDismiss: () => void;
  toast: ToastState | null;
}

// 주문 흐름 공통 토스트. 팝업의 transform·backdrop-filter가 fixed 위치의
// 기준이 되지 않도록 body로 포털하고, 스크린리더에도 알린다.
export const OrderToast = ({ onDismiss, toast }: OrderToastProps) => {
  // 렌더마다 새로 만들어지는 콜백이 타이머를 되감지 않도록 ref로 잡아둔다.
  const dismissRef = useRef(onDismiss);

  useEffect(() => {
    dismissRef.current = onDismiss;
  });

  useEffect(() => {
    if (!toast) {
      return;
    }

    const timeoutId = window.setTimeout(() => dismissRef.current(), TOAST_DURATION_MS);
    return () => window.clearTimeout(timeoutId);
  }, [toast]);

  return createPortal(
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
  );
};
