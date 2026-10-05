import { INCOMPLETE_ORDER_BANNER_HEIGHT } from "../config/layout";

interface IncompleteOrderBannerProps {
  onOpen: () => void;
}

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
