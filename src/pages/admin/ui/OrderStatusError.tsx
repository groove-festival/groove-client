import { orderStatusErrorMessage } from "../model/adminErrorMessages";
import { type useOrderStatusChange } from "../model/useOrderStatusChange";

interface OrderStatusErrorProps {
  statusChange: ReturnType<typeof useOrderStatusChange>;
}

export const OrderStatusError = ({ statusChange }: OrderStatusErrorProps) =>
  statusChange.changeStatus.isError ? (
    <p className="rounded-lg bg-[#3a2020] p-2 text-xs text-[#ff8b8b]">
      {orderStatusErrorMessage(statusChange.changeStatus.error)}
    </p>
  ) : null;
