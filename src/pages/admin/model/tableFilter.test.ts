import { type AdminOrder } from "./adminOrder";
import {
  filterOrdersByTables,
  formatTableFilter,
  readTableFilter,
  tableFilterStorageKey,
  writeTableFilter,
} from "./tableFilter";

const order = (id: number, tableNumber: number): AdminOrder => ({
  depositorName: null,
  depositorSubmittedAt: null,
  id,
  lines: [],
  orderedAt: "2026-10-01T18:00:00",
  paymentMethod: "TRANSFER",
  status: "PAID",
  tableNumber,
  totalPrice: 0,
});

afterEach(() => {
  window.localStorage.clear();
  vi.restoreAllMocks();
});

describe("filterOrdersByTables", () => {
  const orders = [order(1, 1), order(2, 3), order(3, 5)];

  it("keeps every order when no table is picked", () => {
    expect(filterOrdersByTables(orders, [])).toEqual(orders);
  });

  it("keeps only the picked tables", () => {
    expect(filterOrdersByTables(orders, [3, 5]).map((o) => o.id)).toEqual([2, 3]);
  });
});

describe("table filter storage", () => {
  it("remembers the picked tables per pub", () => {
    writeTableFilter("cse", [5, 3]);

    expect(readTableFilter("cse")).toEqual([3, 5]);
    expect(readTableFilter("other")).toEqual([]);
  });

  it("forgets the filter when every table is shown again", () => {
    writeTableFilter("cse", [3]);
    writeTableFilter("cse", []);

    expect(window.localStorage.getItem(tableFilterStorageKey("cse"))).toBeNull();
  });

  it("falls back to every table when the stored value is broken or unreadable", () => {
    window.localStorage.setItem(tableFilterStorageKey("cse"), "not json");
    expect(readTableFilter("cse")).toEqual([]);

    window.localStorage.setItem(
      tableFilterStorageKey("cse"),
      JSON.stringify([2, "x", -1, 2]),
    );
    expect(readTableFilter("cse")).toEqual([2]);

    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    expect(readTableFilter("cse")).toEqual([]);
  });
});

describe("formatTableFilter", () => {
  it("summarizes the picked tables briefly", () => {
    expect(formatTableFilter([])).toBe("전체 테이블");
    expect(formatTableFilter([3, 5])).toBe("3·5번");
    expect(formatTableFilter([1, 2, 3, 4, 5, 6])).toBe("1·2·3·4 외 2개");
  });
});
