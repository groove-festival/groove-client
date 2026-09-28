import { useCallback, useState } from "react";

import { useChangeOrderStatus } from "../api/changeOrderStatus";
import {
  type AdminOrder,
  type AdminOrderStatus,
  adminOrderStatusLabels,
} from "./adminOrder";

// 입금 확인·주방·주문 내역 화면이 같은 규칙으로 주문 상태를 바꾼다. 취소는
// 되돌릴 수 없어 확인을 한 번 더 받고, 나머지 전이는 바로 보낸다.
export function useOrderStatusChange() {
  const changeStatus = useChangeOrderStatus();
  const [cancelTarget, setCancelTarget] = useState<AdminOrder | null>(null);

  // 5초 폴링 때문에 화면이 계속 다시 그려진다. 인라인 화살표를 넘기면
  // ConfirmDialog의 포커스 effect가 매 폴링마다 다시 돌아 포커스를 빼앗는다.
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
