import { type AdminOrder } from "./adminOrder";
import {
  isLateKitchenOrder,
  minutesSinceOrdered,
  summarizeKitchenMenus,
} from "./kitchenQueue";

const order = (over: Partial<AdminOrder>): AdminOrder => ({
  depositorName: null,
  depositorSubmittedAt: null,
  id: 1,
  lines: [],
  orderedAt: "2026-10-01T18:00:00+09:00",
  paymentMethod: "TRANSFER",
  status: "PAID",
  tableNumber: 1,
  totalPrice: 0,
  ...over,
});

describe("summarizeKitchenMenus", () => {
  it("adds up the same menu across orders, most-needed first", () => {
    const totals = summarizeKitchenMenus([
      order({
        id: 1,
        lines: [
          { menuId: 1, name: "콜라", price: 2_000, quantity: 1 },
          { menuId: 2, name: "닭발", price: 15_000, quantity: 1 },
        ],
      }),
      order({
        id: 2,
        lines: [{ menuId: 2, name: "닭발", price: 15_000, quantity: 2 }],
      }),
    ]);

    expect(totals).toEqual([
      { menuId: 2, name: "닭발", quantity: 3 },
      { menuId: 1, name: "콜라", quantity: 1 },
    ]);
  });

  it("returns nothing when there is nothing to cook", () => {
    expect(summarizeKitchenMenus([])).toEqual([]);
  });
});

describe("minutesSinceOrdered", () => {
  const orderedAt = Date.parse("2026-10-01T18:00:00+09:00");

  it("counts whole minutes since the order", () => {
    expect(minutesSinceOrdered(order({}), orderedAt + 12.5 * 60_000)).toBe(12);
  });

  it("does not guess before the first poll or for unreadable times", () => {
    expect(minutesSinceOrdered(order({}), 0)).toBeNull();
    expect(minutesSinceOrdered(order({ orderedAt: "bad" }), orderedAt)).toBeNull();
  });

  it("flags orders waiting 20 minutes or more", () => {
    expect(isLateKitchenOrder(order({}), orderedAt + 19 * 60_000)).toBe(false);
    expect(isLateKitchenOrder(order({}), orderedAt + 20 * 60_000)).toBe(true);
  });
});
