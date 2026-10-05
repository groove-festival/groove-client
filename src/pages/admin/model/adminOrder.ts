export type AdminOrderStatus =
  "PENDING_DEPOSIT" | "DEPOSIT_CLAIMED" | "PAID" | "COMPLETED" | "CANCELED";

export type AdminPaymentMethod = "TRANSFER" | "CASH";

export interface AdminOrderLineOption {
  label: string;
  priceDelta: number;
}

export interface AdminOrderLine {
  itemId: number;
  menuId: number;
  name: string;
  options: AdminOrderLineOption[];

  price: number;
  quantity: number;

  servedAt: string | null;
}

export interface AdminOrder {
  depositorName: string | null;
  depositorSubmittedAt: string | null;
  id: number;
  lines: AdminOrderLine[];
  orderedAt: string;
  paymentMethod: AdminPaymentMethod;
  status: AdminOrderStatus;
  tableNumber: number;
  totalPrice: number;
}

export const formatAdminLineName = (line: Pick<AdminOrderLine, "name" | "options">) =>
  line.options.length
    ? `${line.name} (${line.options.map((option) => option.label).join(", ")})`
    : line.name;

export const adminOrderStatusLabels: Record<AdminOrderStatus, string> = {
  PENDING_DEPOSIT: "입금대기",
  DEPOSIT_CLAIMED: "입금확인중",
  PAID: "결제완료",
  COMPLETED: "완료",
  CANCELED: "취소",
};

export const allowedAdminOrderTransitions: Record<
  AdminOrderStatus,
  AdminOrderStatus[]
> = {
  PENDING_DEPOSIT: ["PAID", "CANCELED"],
  DEPOSIT_CLAIMED: ["PAID", "CANCELED"],
  PAID: ["COMPLETED", "CANCELED"],
  COMPLETED: ["CANCELED"],
  CANCELED: [],
};

export const getAllowedAdminOrderTransitions = (
  status: AdminOrderStatus,
): AdminOrderStatus[] => allowedAdminOrderTransitions[status];

export const adminOrderTransitionLabels: Record<AdminOrderStatus, string> = {
  PENDING_DEPOSIT: "입금대기로",
  DEPOSIT_CLAIMED: "입금확인중으로",
  PAID: "결제완료",
  COMPLETED: "서빙완료",
  CANCELED: "주문취소",
};

export const STALE_PENDING_DEPOSIT_MS = 30 * 60 * 1000;

const elapsedMs = (isoTime: string | null, now: number): number | null => {
  if (!isoTime) {
    return null;
  }

  const parsed = Date.parse(isoTime);

  return Number.isNaN(parsed) ? null : now - parsed;
};

export const isStalePendingDeposit = (order: AdminOrder, now: number): boolean => {
  if (order.status !== "PENDING_DEPOSIT") {
    return false;
  }

  const elapsed = elapsedMs(order.orderedAt, now);

  return elapsed !== null && elapsed >= STALE_PENDING_DEPOSIT_MS;
};

const byTimeAscending = (left: string | null, right: string | null): number =>
  Date.parse(left ?? "") - Date.parse(right ?? "");

export interface AdminOrderBoard {
  depositClaimed: AdminOrder[];

  pendingDeposit: AdminOrder[];

  stalePendingDeposit: AdminOrder[];

  paid: AdminOrder[];

  closed: AdminOrder[];
}

export const partitionAdminOrders = (
  orders: AdminOrder[],
  now: number,
): AdminOrderBoard => {
  const board: AdminOrderBoard = {
    depositClaimed: [],
    pendingDeposit: [],
    stalePendingDeposit: [],
    paid: [],
    closed: [],
  };

  for (const order of orders) {
    switch (order.status) {
      case "DEPOSIT_CLAIMED":
        board.depositClaimed.push(order);
        break;
      case "PENDING_DEPOSIT":
        if (isStalePendingDeposit(order, now)) {
          board.stalePendingDeposit.push(order);
        } else {
          board.pendingDeposit.push(order);
        }
        break;
      case "PAID":
        board.paid.push(order);
        break;
      case "COMPLETED":
      case "CANCELED":
        board.closed.push(order);
        break;
    }
  }

  board.depositClaimed.sort((left, right) =>
    byTimeAscending(
      left.depositorSubmittedAt ?? left.orderedAt,
      right.depositorSubmittedAt ?? right.orderedAt,
    ),
  );
  board.pendingDeposit.sort((left, right) =>
    byTimeAscending(left.orderedAt, right.orderedAt),
  );
  board.stalePendingDeposit.sort((left, right) =>
    byTimeAscending(left.orderedAt, right.orderedAt),
  );
  board.paid.sort((left, right) => byTimeAscending(left.orderedAt, right.orderedAt));
  board.closed.sort((left, right) => byTimeAscending(right.orderedAt, left.orderedAt));

  return board;
};
