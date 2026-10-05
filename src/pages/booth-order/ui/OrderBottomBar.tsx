import { OrderActionButton } from "./OrderActionButton";

interface OrderBottomBarProps {
  isDisabled?: boolean;
  isVisible: boolean;
  label: string;
  onClick: () => void;
}

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
