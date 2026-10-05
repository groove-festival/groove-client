import { type AdminOrder } from "./adminOrder";
import { groupOrdersByTable } from "./tableOrders";

const order = (over: Partial<AdminOrder>): AdminOrder => ({
  depositorName: null,
  depositorSubmittedAt: null,
  id: 1,
  lines: [],
  orderedAt: "2026-10-01T18:00:00",
  paymentMethod: "TRANSFER",
  status: "PAID",
  tableNumber: 1,
  totalPrice: 10_000,
  ...over,
});

describe("groupOrdersByTable", () => {
  const orders = [
    order({ id: 1, tableNumber: 2, orderedAt: "2026-10-01T18:00:00" }),
    order({ id: 2, tableNumber: 1, orderedAt: "2026-10-01T18:10:00" }),
    order({
      id: 3,
      tableNumber: 2,
      orderedAt: "2026-10-01T18:30:00",
      totalPrice: 5_000,
    }),

    order({
      id: 4,
      tableNumber: 1,
      orderedAt: "2026-10-01T19:00:00",
      status: "CANCELED",
    }),

    order({ id: 5, tableNumber: 9, orderedAt: "2026-10-01T17:00:00" }),
  ];

  it("keeps registered tables without orders and sums non-canceled orders", () => {
    const tables = groupOrdersByTable(orders, [1, 2, 3], "number");

    expect(tables.map((table) => table.tableNumber)).toEqual([1, 2, 3, 9]);
    expect(tables[0]).toMatchObject({
      activeAmount: 10_000,
      activeCount: 1,
      canceledCount: 1,
      lastOrderedAt: "2026-10-01T18:10:00",
    });
    expect(tables[0].orders.map((o) => o.id)).toEqual([4, 2]);
    expect(tables[1]).toMatchObject({ activeAmount: 15_000, activeCount: 2 });
    expect(tables[2]).toMatchObject({ activeCount: 0, lastOrderedAt: null });
  });

  it("puts the table whose last order is oldest first and empty tables last", () => {
    const tables = groupOrdersByTable(orders, [1, 2, 3, 4], "oldestLastOrder");

    expect(tables.map((table) => table.tableNumber)).toEqual([9, 1, 2, 3, 4]);
  });
});
