import { useCallback, useState } from "react";

import { useChangeOrderStatus } from "../api/changeOrderStatus";
import {
  type AdminOrder,
  type AdminOrderStatus,
  adminOrderStatusLabels,
} from "./adminOrder";

export function useOrderStatusChange() {
  const changeStatus = useChangeOrderStatus();
  const [cancelTarget, setCancelTarget] = useState<AdminOrder | null>(null);

  const closeCancelDialog = useCallback(() => setCancelTarget(null), []);

  const requestStatusChange = (order: AdminOrder, status: AdminOrderStatus) => {
    if (status === "CANCELED") {
      setCancelTarget(order);
      return;
    }

    changeStatus.mutate({ orderId: order.id, status });
  };

  const confirmCancel = () => {
    if (cancelTarget) {
      changeStatus.mutate({ orderId: cancelTarget.id, status: "CANCELED" });
    }
    setCancelTarget(null);
  };

  const cancelDescription = cancelTarget
    ? `${cancelTarget.tableNumber}번 테이블 · ${adminOrderStatusLabels[cancelTarget.status]} 주문이에요. 취소하면 되돌릴 수 없어요.`
    : undefined;

  return {
    cancelDescription,
    changeStatus,
    closeCancelDialog,
    confirmCancel,
    isCancelDialogOpen: cancelTarget !== null,
    requestStatusChange,
  };
}
