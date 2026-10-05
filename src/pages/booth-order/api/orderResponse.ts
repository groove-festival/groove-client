import { type PaymentMethod, type OrderStatus, type PlacedOrder } from "../model/order";

export interface OrderAccountResponseBody {
  accountHolder: string;
  accountNumber: string;
  bankName: string;
}

export interface OrderItemOptionResponseBody {
  label: string;
  priceDelta: number;
}

export interface OrderItemResponseBody {
  lineAmount: number;
  menuId: number;
  menuName: string;
  options?: OrderItemOptionResponseBody[] | null;
  quantity: number;
  unitPrice: number;
}

export interface OrderResponseBody {
  account: OrderAccountResponseBody;
  depositorName?: string | null;
  items: OrderItemResponseBody[];
  orderId: number;
  orderToken?: string;
  paymentMethod: PaymentMethod;
  pubName: string;
  status: OrderStatus;
  totalAmount: number;
}

export const toPlacedOrder = (order: OrderResponseBody): PlacedOrder => ({
  account: {
    accountNumber: order.account.accountNumber,
    bank: order.account.bankName,
    holder: order.account.accountHolder,
  },
  depositorName: order.depositorName ?? null,
  id: order.orderId,
  lines: order.items.map((item) => ({
    menuId: item.menuId,
    name: item.menuName,
    options: (item.options ?? []).map(({ label, priceDelta }) => ({
      label,
      priceDelta,
    })),
    price: item.unitPrice,
    quantity: item.quantity,
  })),
  paymentMethod: order.paymentMethod,
  pubName: order.pubName,
  status: order.status,
  totalPrice: order.totalAmount,
});
