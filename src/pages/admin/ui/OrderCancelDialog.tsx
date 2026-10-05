import { type useOrderStatusChange } from "../model/useOrderStatusChange";
import { ConfirmDialog } from "./ConfirmDialog";

interface OrderCancelDialogProps {
  statusChange: ReturnType<typeof useOrderStatusChange>;
}

export const OrderCancelDialog = ({ statusChange }: OrderCancelDialogProps) => (
  <ConfirmDialog
    confirmLabel="주문취소"
    danger
    description={statusChange.cancelDescription}
    onCancel={statusChange.closeCancelDialog}
    onConfirm={statusChange.confirmCancel}
    open={statusChange.isCancelDialogOpen}
    title="이 주문을 취소할까요?"
  />
);
