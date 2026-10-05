interface OrderStorageNoticeProps {
  onRetry: () => void;
}

export const OrderStorageNotice = ({ onRetry }: OrderStorageNoticeProps) => (
  <aside
    className="w-full rounded-xl bg-[#3a2020] p-3 text-sm text-[#ff8b8b]"
    role="alert"
  >
    <p>
      주문을 이 브라우저에 저장하지 못했어요. 새로고침하거나 화면을 닫으면 주문을 다시
      확인하기 어려울 수 있어요.
    </p>
    <button className="mt-2 underline" onClick={onRetry} type="button">
      주문 저장 다시 시도
    </button>
  </aside>
);
