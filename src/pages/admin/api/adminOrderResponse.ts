import {
  type AdminOrder,
  type AdminOrderStatus,
  type AdminPaymentMethod,
} from "../model/adminOrder";

// PUB-A8(목록)과 PUB-A9(상태 변경)가 공유하는 주문 응답. 필드 이름을 프론트
// 모델로 맞추는 일은 여기서만 한다.
// unitPrice는 옵션 가격 차이를 이미 더한 값이다. 옵션은 나중에 붙은 필드라
// 옵션이 없는 서버는 보내지 않는다.
export interface AdminOrderLineResponseBody {
  lineAmount: number;
  menuId: number;
  menuName: string;
  options?: { label: string; priceDelta: number }[] | null;
  orderItemId: number;
  quantity: number;
  servedAt?: string | null;
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
    itemId: item.orderItemId,
    menuId: item.menuId,
    name: item.menuName,
    options: (item.options ?? []).map(({ label, priceDelta }) => ({
      label,
      priceDelta,
    })),
    price: item.unitPrice,
    quantity: item.quantity,
    servedAt: item.servedAt ?? null,
  })),
  orderedAt: order.orderedAt,
  paymentMethod: order.paymentMethod,
  status: order.status,
  tableNumber: order.tableNumber,
  totalPrice: order.totalAmount,
});
