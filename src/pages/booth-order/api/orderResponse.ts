import { type PaymentMethod, type OrderStatus, type PlacedOrder } from "../model/order";

// PUB-4~7이 공유하는 주문 응답. PUB-4만 orderToken을 주고, PUB-5~7은 대신
// 입금자명을 준다. 서버와 프론트의 계좌 필드 이름이 다르므로 여기서만 맞춘다.
export interface OrderAccountResponseBody {
  accountHolder: string;
  accountNumber: string;
  bankName: string;
}

export interface OrderItemOptionResponseBody {
  label: string;
  priceDelta: number;
}

// unitPrice는 옵션 가격 차이를 이미 더한 값이다 (lineAmount = unitPrice × 수량).
// 옵션은 나중에 붙은 필드라 옵션이 없는 서버는 보내지 않는다.
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
