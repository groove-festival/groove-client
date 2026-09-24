import { type PaymentMethod, type OrderStatus, type PlacedOrder } from "../model/order";

// PUB-4~7이 공유하는 주문 응답. PUB-4만 orderToken을 주고, PUB-5~7은 대신
// 입금자명을 준다. 서버와 프론트의 계좌 필드 이름이 다르므로 여기서만 맞춘다.
export interface OrderAccountResponseBody {
  accountHolder: string;
  accountNumber: string;
  bankName: string;
}

export interface OrderItemResponseBody {
  lineAmount: number;
  menuId: number;
  menuName: string;
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
    price: item.unitPrice,
    quantity: item.quantity,
  })),
  paymentMethod: order.paymentMethod,
  pubName: order.pubName,
  status: order.status,
  totalPrice: order.totalAmount,
});
