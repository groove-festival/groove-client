import {
  type AdminOrder,
  type AdminOrderStatus,
  type AdminPaymentMethod,
} from "../model/adminOrder";

// PUB-A8(목록)과 PUB-A9(상태 변경)가 공유하는 주문 응답. 필드 이름을 프론트
// 모델로 맞추는 일은 여기서만 한다.
export interface AdminOrderLineResponseBody {
  lineAmount: number;
  menuId: number;
  menuName: string;
  quantity: number;
  unitPrice: number;
}

export interface AdminOrderResponseBody {
  depositorName?: string | null;
  depositorSubmittedAt?: string | null;
  items: AdminOrderLineResponseBody[];
  orderId: number;
  orderedAt: string;
  paymentMethod: AdminPaymentMethod;
  status: AdminOrderStatus;
  tableNumber: number;
  totalAmount: number;
}

export const toAdminOrder = (order: AdminOrderResponseBody): AdminOrder => ({
  depositorName: order.depositorName ?? null,
  depositorSubmittedAt: order.depositorSubmittedAt ?? null,
  id: order.orderId,
  lines: order.items.map((item) => ({
    menuId: item.menuId,
    name: item.menuName,
    price: item.unitPrice,
    quantity: item.quantity,
  })),
  orderedAt: order.orderedAt,
  paymentMethod: order.paymentMethod,
  status: order.status,
  tableNumber: order.tableNumber,
  totalPrice: order.totalAmount,
});
