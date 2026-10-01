import { OrderActionButton } from "./OrderActionButton";

interface OrderBottomBarProps {
  // 주문 요청이 가는 동안 버튼을 잠근다. 느린 망에서 다시 누르면 같은 주문이 또 들어간다.
  isDisabled?: boolean;
  isVisible: boolean;
  label: string;
  onClick: () => void;
}

// 메뉴를 담는 즉시 화면 하단에서 올라오는 주문하기 버튼 영역. 숨길 때는
// 아래로 내려 보내고 포커스·클릭이 닿지 않게 inert 처리한다.
export const OrderBottomBar = ({
  isDisabled = false,
  isVisible,
  label,
  onClick,
}: OrderBottomBarProps) => {
  return (
    <div
      className={`fixed bottom-0 left-1/2 z-40 w-full max-w-[600px] -translate-x-1/2 bg-[#1c1c1c] px-2.5 py-6 transition-transform duration-300 ease-out will-change-transform motion-reduce:transition-none ${
        isVisible ? "translate-y-0" : "translate-y-full"
      }`}
      data-testid="order-bottom-bar"
      inert={!isVisible}
    >
      <OrderActionButton disabled={isDisabled} label={label} onClick={onClick} />
    </div>
  );
};
