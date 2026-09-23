import {
  getOrderScreen,
  isAwaitingDepositorName,
  isOrderInProgress,
  type PlacedOrder,
} from "./order";

const createOrder = (overrides: Partial<PlacedOrder> = {}): PlacedOrder => ({
  account: { accountNumber: "000000-00-000000", bank: "국민", holder: "홍길동" },
  depositorName: null,
  id: 1,
  lines: [{ menuId: 4, name: "닭발", price: 15_000, quantity: 1 }],
  paymentMethod: "TRANSFER",
  pubName: "주막 이름",
  status: "PENDING_DEPOSIT",
  totalPrice: 15_000,
  ...overrides,
});

describe("getOrderScreen", () => {
  it("shows the menu when there is no order", () => {
    expect(getOrderScreen(null)).toBe("menu");
  });

  it("keeps a transfer awaiting deposit on the menu screen", () => {
    // 팝업을 닫은 입금대기는 별도 화면 없이 상단 배너로 대신한다 (FR-1.4-4).
    expect(getOrderScreen(createOrder())).toBe("menu");
  });

  it("sends a cash order to the cash guide", () => {
    expect(getOrderScreen(createOrder({ paymentMethod: "CASH" }))).toBe("cashPending");
  });

  it("maps the remaining statuses to their screens", () => {
    expect(getOrderScreen(createOrder({ status: "DEPOSIT_CLAIMED" }))).toBe(
      "depositClaimed",
    );
    expect(getOrderScreen(createOrder({ status: "PAID" }))).toBe("completed");
    expect(getOrderScreen(createOrder({ status: "COMPLETED" }))).toBe("completed");
  });

  it("shows the cancel notice for an order the admin canceled", () => {
    expect(getOrderScreen(createOrder({ status: "CANCELED" }))).toBe("canceled");
    expect(
      getOrderScreen(createOrder({ paymentMethod: "CASH", status: "CANCELED" })),
    ).toBe("canceled");
  });
});

describe("isAwaitingDepositorName", () => {
  it("reopens only a transfer order that has not submitted a name", () => {
    expect(isAwaitingDepositorName(createOrder())).toBe(true);
    expect(isAwaitingDepositorName(createOrder({ paymentMethod: "CASH" }))).toBe(false);
    expect(isAwaitingDepositorName(createOrder({ status: "DEPOSIT_CLAIMED" }))).toBe(
      false,
    );
    expect(isAwaitingDepositorName(createOrder({ status: "CANCELED" }))).toBe(false);
    expect(isAwaitingDepositorName(null)).toBe(false);
  });
});

describe("isOrderInProgress", () => {
  it("polls until the order reaches a final state", () => {
    expect(isOrderInProgress(createOrder())).toBe(true);
    expect(isOrderInProgress(createOrder({ status: "DEPOSIT_CLAIMED" }))).toBe(true);
    expect(isOrderInProgress(createOrder({ status: "PAID" }))).toBe(true);
  });

  it("stops polling a completed or canceled order", () => {
    expect(isOrderInProgress(createOrder({ status: "COMPLETED" }))).toBe(false);
    expect(isOrderInProgress(createOrder({ status: "CANCELED" }))).toBe(false);
    expect(isOrderInProgress(null)).toBe(false);
  });
});
