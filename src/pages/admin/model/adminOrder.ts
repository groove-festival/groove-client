// 주막 관리자가 다루는 주문. 손님 화면(booth-order)의 PlacedOrder와 필드가
// 다르다 — 관리자는 테이블 번호·주문 시각·입금자명 제출 시각을 받고 계좌는
// 받지 않는다. 같은 pages 레이어의 다른 slice라 타입을 공유하지 않고 여기서
// API 스키마(PUB-A8) 기준으로 따로 선언한다.
export type AdminOrderStatus =
  "PENDING_DEPOSIT" | "DEPOSIT_CLAIMED" | "PAID" | "COMPLETED" | "CANCELED";

export type AdminPaymentMethod = "TRANSFER" | "CASH";

export interface AdminOrderLine {
  menuId: number;
  name: string;
  price: number;
  quantity: number;
}

export interface AdminOrder {
  // 계좌이체인데 아직 입금자명을 내지 않았거나 현금 주문이면 null.
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

// 관리자용 문구. 손님 화면은 "입금 대기 / 입금 확인 중 …"으로 띄어 쓰지만
// 관리자 화면은 붙여 쓴다 (FR-1.8-0).
export const adminOrderStatusLabels: Record<AdminOrderStatus, string> = {
  PENDING_DEPOSIT: "입금대기",
  DEPOSIT_CLAIMED: "입금확인중",
  PAID: "결제완료",
  COMPLETED: "완료",
  CANCELED: "취소",
};

// PUB-A9이 허용하는 전이만 담는다. PENDING_DEPOSIT → DEPOSIT_CLAIMED 는 손님의
// 입금자명 제출(PUB-6)로만 일어나므로 관리자 쪽에 넣지 않는다. CANCELED 에서
// 나가는 전이는 서버가 409(PUB001)로 막는다.
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

// 결제완료가 조리 착수 신호다 (FR-1.8). 버튼 문구가 상태 이름과 같으면 무엇이
// 일어나는지 읽히지 않아 동작으로 적는다.
export const adminOrderTransitionLabels: Record<AdminOrderStatus, string> = {
  PENDING_DEPOSIT: "입금대기로",
  DEPOSIT_CLAIMED: "입금확인중으로",
  PAID: "결제완료",
  COMPLETED: "서빙완료",
  CANCELED: "주문취소",
};

// 입금자명을 낸 지 오래됐는데 아직 대사하지 않은 건은 눈에 띄어야 한다.
export const STALE_DEPOSIT_CLAIM_MS = 10 * 60 * 1000;

// 이 시간을 넘긴 입금대기 건은 접는다. 자동 취소는 하지 않는다 — 이미 이체한
// 손님의 주문을 서버가 취소하면 환불 분쟁이 된다 (PRD §11-17).
export const STALE_PENDING_DEPOSIT_MS = 30 * 60 * 1000;

const elapsedMs = (isoTime: string | null, now: number): number | null => {
  if (!isoTime) {
    return null;
  }

  const parsed = Date.parse(isoTime);

  return Number.isNaN(parsed) ? null : now - parsed;
};

// 대사를 오래 기다린 입금확인중 건인지. 시각을 못 읽으면 강조하지 않는다.
export const isStaleDepositClaim = (order: AdminOrder, now: number): boolean => {
  if (order.status !== "DEPOSIT_CLAIMED") {
    return false;
  }

  const elapsed = elapsedMs(order.depositorSubmittedAt ?? order.orderedAt, now);

  return elapsed !== null && elapsed >= STALE_DEPOSIT_CLAIM_MS;
};

// 접어둘 장기 미입금 건인지.
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
  // 결제 확인 전 — 입금자명을 낸 건.
  depositClaimed: AdminOrder[];
  // 결제 확인 전 — 입금자명을 아직 내지 않은 건.
  pendingDeposit: AdminOrder[];
  // 접어둘 장기 미입금 건. pendingDeposit과 겹치지 않는다.
  stalePendingDeposit: AdminOrder[];
  // 결제 확인 후 — 조리·서빙 중.
  paid: AdminOrder[];
  // 종료 — 완료·취소.
  closed: AdminOrder[];
}

// 운영팀 요구는 "결제 확인 전"과 "결제가 확인돼 실제 주문으로 들어간" 명단이
// 갈려 보이는 것이다 (FR-1.8-2). 서버는 한 배열로 내려주므로 여기서 가른다.
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

  // 대사·조리는 먼저 들어온 순서대로 처리한다. 종료된 주문은 방금 처리한 것을
  // 확인하는 용도라 최신이 위로 온다.
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
