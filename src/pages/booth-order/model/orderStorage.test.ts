import {
  getOrderStorageKey,
  readStoredOrderRef,
  type StoredOrderRef,
  writeStoredOrderRef,
} from "./orderStorage";

const storageKey = getOrderStorageKey("elec-eh", "table-a");

const orderRef: StoredOrderRef = { orderId: 1, orderToken: "token-1" };

describe("orderStorage", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("stores the order reference per booth and table", () => {
    writeStoredOrderRef(storageKey, orderRef);

    expect(readStoredOrderRef(storageKey)).toEqual(orderRef);
    expect(readStoredOrderRef(getOrderStorageKey("elec-eh", "table-b"))).toBeNull();
  });

  it("removes the order reference when cleared", () => {
    writeStoredOrderRef(storageKey, orderRef);
    writeStoredOrderRef(storageKey, null);

    expect(window.localStorage.getItem(storageKey)).toBeNull();
  });

  it("ignores malformed or incomplete stored values", () => {
    window.localStorage.setItem(storageKey, "{not json");
    expect(readStoredOrderRef(storageKey)).toBeNull();

    // 토큰 없이 주문 식별자만 남은 값은 PUB-5를 호출할 수 없다.
    window.localStorage.setItem(storageKey, JSON.stringify({ orderId: 1 }));
    expect(readStoredOrderRef(storageKey)).toBeNull();
  });
});
