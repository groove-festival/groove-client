import {
  type AdminOrder,
  type AdminOrderStatus,
  type AdminPaymentMethod,
} from "../model/adminOrder";

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
