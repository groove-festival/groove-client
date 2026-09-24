import {
  type AdminOrder,
  type AdminOrderStatus,
  getAllowedAdminOrderTransitions,
  isStaleDepositClaim,
  isStalePendingDeposit,
  partitionAdminOrders,
  STALE_PENDING_DEPOSIT_MS,
} from "./adminOrder";

const NOW = Date.parse("2026-10-01T20:00:00.000Z");

const minutesAgo = (minutes: number) =>
  new Date(NOW - minutes * 60 * 1000).toISOString();

const order = (over: Partial<AdminOrder>): AdminOrder => ({
  depositorName: null,
  depositorSubmittedAt: null,
  id: 1,
  lines: [{ menuId: 4, name: "닭발", price: 15_000, quantity: 1 }],
  orderedAt: minutesAgo(1),
  paymentMethod: "TRANSFER",
  status: "PENDING_DEPOSIT",
  tableNumber: 3,
  totalPrice: 15_000,
  ...over,
});

describe("allowed transitions", () => {
  it("offers only what PUB-A9 accepts from each status", () => {
    expect(getAllowedAdminOrderTransitions("DEPOSIT_CLAIMED")).toEqual([
      "PAID",
      "CANCELED",
    ]);
    // 현금 결제 단축 전이 (FR-1.4-5).
    expect(getAllowedAdminOrderTransitions("PENDING_DEPOSIT")).toEqual([
      "PAID",
      "CANCELED",
    ]);
    expect(getAllowedAdminOrderTransitions("PAID")).toEqual(["COMPLETED", "CANCELED"]);
  });

  it("never leaves a canceled order", () => {
    expect(getAllowedAdminOrderTransitions("CANCELED")).toEqual([]);
  });

  it("does not let the administrator mark a deposit as claimed", () => {
    // 입금확인중으로 가는 것은 손님의 입금자명 제출(PUB-6)로만 일어난다.
    expect(getAllowedAdminOrderTransitions("PENDING_DEPOSIT")).not.toContain(
      "DEPOSIT_CLAIMED",
    );
  });

  it("does not skip payment confirmation on the way to completion", () => {
    expect(getAllowedAdminOrderTransitions("PENDING_DEPOSIT")).not.toContain(
      "COMPLETED",
    );
    expect(getAllowedAdminOrderTransitions("DEPOSIT_CLAIMED")).not.toContain(
      "COMPLETED",
    );
  });
});

describe("partitionAdminOrders", () => {
  it("separates orders awaiting payment confirmation from confirmed ones", () => {
    const board = partitionAdminOrders(
      [
        order({ id: 1, status: "PENDING_DEPOSIT" }),
        order({ id: 2, status: "DEPOSIT_CLAIMED", depositorName: "김입금" }),
        order({ id: 3, status: "PAID" }),
        order({ id: 4, status: "COMPLETED" }),
        order({ id: 5, status: "CANCELED" }),
      ],
      NOW,
    );

    expect(board.depositClaimed.map((item) => item.id)).toEqual([2]);
    expect(board.pendingDeposit.map((item) => item.id)).toEqual([1]);
    expect(board.paid.map((item) => item.id)).toEqual([3]);
    expect(board.closed.map((item) => item.id)).toEqual([4, 5]);
  });

  it("folds long-unpaid orders away instead of dropping or canceling them", () => {
    const stale = order({
      id: 9,
      orderedAt: minutesAgo(STALE_PENDING_DEPOSIT_MS / 60_000 + 1),
    });
    const board = partitionAdminOrders([stale, order({ id: 10 })], NOW);

    expect(board.pendingDeposit.map((item) => item.id)).toEqual([10]);
    expect(board.stalePendingDeposit.map((item) => item.id)).toEqual([9]);
  });

  it("queues deposit claims oldest first so the earliest submission is handled first", () => {
    const board = partitionAdminOrders(
      [
        order({
          id: 1,
          status: "DEPOSIT_CLAIMED",
          depositorSubmittedAt: minutesAgo(1),
        }),
        order({
          id: 2,
          status: "DEPOSIT_CLAIMED",
          depositorSubmittedAt: minutesAgo(5),
        }),
        order({
          id: 3,
          status: "DEPOSIT_CLAIMED",
          depositorSubmittedAt: minutesAgo(3),
        }),
      ],
      NOW,
    );

    expect(board.depositClaimed.map((item) => item.id)).toEqual([2, 3, 1]);
  });

  it("shows the most recently finished order first", () => {
    const board = partitionAdminOrders(
      [
        order({ id: 1, status: "COMPLETED", orderedAt: minutesAgo(30) }),
        order({ id: 2, status: "CANCELED", orderedAt: minutesAgo(5) }),
      ],
      NOW,
    );

    expect(board.closed.map((item) => item.id)).toEqual([2, 1]);
  });

  it("treats every order as fresh before the first poll lands", () => {
    // dataUpdatedAt은 아직 받아온 적이 없으면 0이다. 그때 전부 오래된 것으로
    // 접히면 주문이 통째로 사라져 보인다.
    const board = partitionAdminOrders([order({ id: 1 })], 0);

    expect(board.stalePendingDeposit).toEqual([]);
    expect(board.pendingDeposit.map((item) => item.id)).toEqual([1]);
  });
});

describe("stale markers", () => {
  it("highlights a deposit claim that has waited too long", () => {
    expect(
      isStaleDepositClaim(
        order({ status: "DEPOSIT_CLAIMED", depositorSubmittedAt: minutesAgo(11) }),
        NOW,
      ),
    ).toBe(true);
    expect(
      isStaleDepositClaim(
        order({ status: "DEPOSIT_CLAIMED", depositorSubmittedAt: minutesAgo(2) }),
        NOW,
      ),
    ).toBe(false);
  });

  it("ignores unreadable timestamps instead of hiding the order", () => {
    expect(isStalePendingDeposit(order({ orderedAt: "not-a-date" }), NOW)).toBe(false);
  });

  it("only marks orders in the matching status", () => {
    const longAgo = minutesAgo(600);

    expect(
      isStalePendingDeposit(order({ status: "PAID", orderedAt: longAgo }), NOW),
    ).toBe(false);
    expect(
      isStaleDepositClaim(
        order({ status: "PENDING_DEPOSIT", orderedAt: longAgo }),
        NOW,
      ),
    ).toBe(false);
  });
});

describe("status coverage", () => {
  it("has a transition entry for every status", () => {
    const statuses: AdminOrderStatus[] = [
      "PENDING_DEPOSIT",
      "DEPOSIT_CLAIMED",
      "PAID",
      "COMPLETED",
      "CANCELED",
    ];

    for (const status of statuses) {
      expect(getAllowedAdminOrderTransitions(status)).toBeDefined();
    }
  });
});
