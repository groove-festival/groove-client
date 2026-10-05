import {
  getOrderStorageKey,
  readStoredOrderRef,
  type StoredOrderRef,
  writeStoredOrderRef,
} from "./orderStorage";

const storageKey = getOrderStorageKey("elec-eh", "table-a");

const orderRef: StoredOrderRef = { orderId: 1, orderToken: "token-1" };

afterEach(() => vi.restoreAllMocks());

describe("orderStorage", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("stores the order reference per booth and table", () => {
    expect(writeStoredOrderRef(storageKey, orderRef)).toBe(true);

    expect(readStoredOrderRef(storageKey)).toEqual(orderRef);
    expect(readStoredOrderRef(getOrderStorageKey("elec-eh", "table-b"))).toBeNull();
  });

  it("reports a blocked save or removal without throwing", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    vi.spyOn(Storage.prototype, "removeItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    expect(writeStoredOrderRef(storageKey, orderRef)).toBe(false);
    expect(writeStoredOrderRef(storageKey, null)).toBe(false);
  });

  it("removes the order reference when cleared", () => {
    writeStoredOrderRef(storageKey, orderRef);
    writeStoredOrderRef(storageKey, null);

    expect(window.localStorage.getItem(storageKey)).toBeNull();
  });

  it("ignores malformed or incomplete stored values", () => {
    window.localStorage.setItem(storageKey, "{not json");
    expect(readStoredOrderRef(storageKey)).toBeNull();

    window.localStorage.setItem(storageKey, JSON.stringify({ orderId: 1 }));
    expect(readStoredOrderRef(storageKey)).toBeNull();
  });
});
