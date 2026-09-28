import { orderStatusErrorMessage } from "../model/adminErrorMessages";
import { type useOrderStatusChange } from "../model/useOrderStatusChange";

interface OrderStatusErrorProps {
  statusChange: ReturnType<typeof useOrderStatusChange>;
}

// 상태 변경 실패 안내. 주문 화면마다 목록 위에 같은 모양으로 띄운다.
export const OrderStatusError = ({ statusChange }: OrderStatusErrorProps) =>
  statusChange.changeStatus.isError ? (
    <p className="rounded-lg bg-[#3a2020] p-2 text-xs text-[#ff8b8b]">
      {orderStatusErrorMessage(statusChange.changeStatus.error)}
    </p>
  ) : null;
