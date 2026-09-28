import {
  ADDITIONAL_ORDER_TTL_MS,
  getAdditionalOrderStorageKey,
  getOrderStorageKey,
  readAdditionalOrderMark,
  writeAdditionalOrderMark,
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

describe("additional order mark", () => {
  const key = getAdditionalOrderStorageKey("booth", "table");

  afterEach(() => window.localStorage.clear());

  it("remembers that this device already ordered at this table, for a while", () => {
    expect(readAdditionalOrderMark(key)).toBe(false);

    writeAdditionalOrderMark(key, 1_000);

    expect(readAdditionalOrderMark(key, 1_000 + ADDITIONAL_ORDER_TTL_MS - 1)).toBe(
      true,
    );
    // 몇 시간 뒤 같은 자리에 다시 앉은 건 새 방문이다.
    expect(readAdditionalOrderMark(key, 1_000 + ADDITIONAL_ORDER_TTL_MS)).toBe(false);
    expect(
      readAdditionalOrderMark(getAdditionalOrderStorageKey("booth", "other"), 1_000),
    ).toBe(false);
  });

  it("treats a broken value as a first order", () => {
    window.localStorage.setItem(key, "not-a-time");

    expect(readAdditionalOrderMark(key)).toBe(false);
  });
});
