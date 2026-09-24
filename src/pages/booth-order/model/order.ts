// 주문 상태·결제수단 값은 API 명세 v0.6 §1.5에서 확정된 프론트 계약을 따른다.
export type OrderStatus =
  "PENDING_DEPOSIT" | "DEPOSIT_CLAIMED" | "PAID" | "COMPLETED" | "CANCELED";
export type PaymentMethod = "TRANSFER" | "CASH";

// 계좌는 주막이 아니라 주문 응답(PUB-4~7)에 담겨 온다.
export interface OrderAccount {
  accountNumber: string;
  bank: string;
  holder: string;
}

export interface OrderLine {
  menuId: number;
  name: string;
  price: number;
  quantity: number;
}

export interface PlacedOrder {
  account: OrderAccount;
  depositorName: string | null;
  id: number;
  lines: OrderLine[];
  paymentMethod: PaymentMethod;
  pubName: string;
  status: OrderStatus;
  totalPrice: number;
}

// 주문 화면이 보여줄 단계. 상태·결제수단 조합에서 유도한다.
export type OrderScreen =
  "menu" | "depositClaimed" | "cashPending" | "completed" | "canceled";

export const getOrderScreen = (order: PlacedOrder | null): OrderScreen => {
  if (!order) {
    return "menu";
  }

  switch (order.status) {
    case "CANCELED":
      return "canceled";
    case "PAID":
    case "COMPLETED":
      return "completed";
    case "DEPOSIT_CLAIMED":
      return "depositClaimed";
    case "PENDING_DEPOSIT":
      // 계좌이체 입금대기는 별도 화면 없이 메뉴 화면의 미완료 배너로 대신한다.
      return order.paymentMethod === "CASH" ? "cashPending" : "menu";
  }
};

// 배너는 입금자명을 아직 내지 않은 계좌이체 주문만 다시 연다 (PRD §11-18).
export const isAwaitingDepositorName = (order: PlacedOrder | null) =>
  order?.status === "PENDING_DEPOSIT" && order.paymentMethod === "TRANSFER";

// 관리자가 상태를 올리는 동안만 폴링한다. 완료·취소는 더 바뀌지 않는다.
export const isOrderInProgress = (order: PlacedOrder | null) =>
  order?.status === "PENDING_DEPOSIT" ||
  order?.status === "DEPOSIT_CLAIMED" ||
  order?.status === "PAID";

export const normalizeDepositorName = (value: string) => value.trim();
