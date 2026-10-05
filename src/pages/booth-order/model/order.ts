export type OrderStatus =
  "PENDING_DEPOSIT" | "DEPOSIT_CLAIMED" | "PAID" | "COMPLETED" | "CANCELED";
export type PaymentMethod = "TRANSFER" | "CASH";

export interface OrderAccount {
  accountNumber: string;
  bank: string;
  holder: string;
}

export interface OrderLineOption {
  label: string;
  priceDelta: number;
}

export interface OrderLine {
  menuId: number;
  name: string;
  options: OrderLineOption[];

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

export type OrderScreen =
  "menu" | "depositClaimed" | "cashPending" | "completed" | "served" | "canceled";

export const getOrderScreen = (order: PlacedOrder | null): OrderScreen => {
  if (!order) {
    return "menu";
  }

  switch (order.status) {
    case "CANCELED":
      return "canceled";
    case "PAID":
      return "completed";
    case "COMPLETED":
      return "served";
    case "DEPOSIT_CLAIMED":
      return "depositClaimed";
    case "PENDING_DEPOSIT":
      return order.paymentMethod === "CASH" ? "cashPending" : "menu";
  }
};

export const isAwaitingDepositorName = (order: PlacedOrder | null) =>
  order?.status === "PENDING_DEPOSIT" && order.paymentMethod === "TRANSFER";

export const isOrderInProgress = (order: PlacedOrder | null) =>
  order?.status === "PENDING_DEPOSIT" ||
  order?.status === "DEPOSIT_CLAIMED" ||
  order?.status === "PAID";

export const normalizeDepositorName = (value: string) => value.trim();
