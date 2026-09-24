import { INCOMPLETE_ORDER_BANNER_HEIGHT } from "../config/layout";

interface IncompleteOrderBannerProps {
  onOpen: () => void;
}

// 입금자명을 내지 않고 나간 주문이 있을 때 상단바 위에 고정되는 배너.
// 상단바가 스크롤로 숨을 때 배너 뒤로 들어가도록 헤더보다 위에 둔다.
export const IncompleteOrderBanner = ({ onOpen }: IncompleteOrderBannerProps) => {
  return (
    <button
      className="fixed top-0 left-1/2 z-[55] flex w-full max-w-[600px] -translate-x-1/2 items-center justify-center bg-[#cfff04] px-2.5 text-xs leading-[14px] font-medium text-[#1c1c1c]"
      onClick={onOpen}
      style={{ height: INCOMPLETE_ORDER_BANNER_HEIGHT }}
      type="button"
    >
      아직 완료되지 않은 주문이 있어요
    </button>
  );
};
