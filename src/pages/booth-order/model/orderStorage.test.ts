import { type PlacedOrder } from "./order";
import { getOrderStorageKey, readStoredOrder, writeStoredOrder } from "./orderStorage";

const storageKey = getOrderStorageKey("electronics-eh", "table-a");

const order: PlacedOrder = {
  depositorName: null,
  id: "order-1",
  lines: [{ menuId: "fee", name: "상차림비", price: 2_000, quantity: 1 }],
  paymentMethod: "TRANSFER",
  status: "PENDING_DEPOSIT",
  totalPrice: 2_000,
};

describe("orderStorage", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("stores the order per booth and table", () => {
    writeStoredOrder(storageKey, order);

    expect(readStoredOrder(storageKey)).toEqual(order);
    expect(readStoredOrder(getOrderStorageKey("electronics-eh", "table-b"))).toBeNull();
  });

  it("removes the order when cleared", () => {
    writeStoredOrder(storageKey, order);
    writeStoredOrder(storageKey, null);

    expect(window.localStorage.getItem(storageKey)).toBeNull();
  });

  it("ignores malformed or unknown stored values", () => {
    window.localStorage.setItem(storageKey, "{not json");
    expect(readStoredOrder(storageKey)).toBeNull();

    window.localStorage.setItem(
      storageKey,
      JSON.stringify({ ...order, status: "CANCELED" }),
    );
    expect(readStoredOrder(storageKey)).toBeNull();
  });
});
