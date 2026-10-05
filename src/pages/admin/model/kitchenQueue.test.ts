import { type AdminOrder } from "./adminOrder";
import { summarizeKitchenMenus } from "./kitchenQueue";

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
          {
            itemId: 1002,
            menuId: 1,
            name: "콜라",
            options: [],
            price: 2_000,
            quantity: 1,
            servedAt: null,
          },
          {
            itemId: 1003,
            menuId: 2,
            name: "닭발",
            options: [],
            price: 15_000,
            quantity: 1,
            servedAt: null,
          },
        ],
      }),
      order({
        id: 2,
        lines: [
          {
            itemId: 1004,
            menuId: 2,
            name: "닭발",
            options: [],
            price: 15_000,
            quantity: 2,
            servedAt: null,
          },
        ],
      }),
    ]);

    expect(totals).toEqual([
      { menuId: 2, name: "닭발", quantity: 3 },
      { menuId: 1, name: "콜라", quantity: 1 },
    ]);
  });

  it("leaves out menus that already went out", () => {
    const totals = summarizeKitchenMenus([
      order({
        lines: [
          {
            itemId: 1,
            menuId: 1,
            name: "콜라",
            options: [],
            price: 2_000,
            quantity: 2,
            servedAt: "2026-10-01T18:05:00",
          },
          {
            itemId: 2,
            menuId: 2,
            name: "닭발",
            options: [],
            price: 15_000,
            quantity: 1,
            servedAt: null,
          },
        ],
      }),
    ]);

    expect(totals).toEqual([{ menuId: 2, name: "닭발", quantity: 1 }]);
  });

  it("returns nothing when there is nothing to cook", () => {
    expect(summarizeKitchenMenus([])).toEqual([]);
  });

  it("counts the same menu separately per option set", () => {
    const line = (itemId: number, labels: string[], quantity: number) => ({
      itemId,
      menuId: 30,
      name: "짜파게티",
      options: labels.map((label) => ({ label, priceDelta: 1_000 })),
      price: 5_000,
      quantity,
      servedAt: null,
    });

    const totals = summarizeKitchenMenus([
      order({ id: 1, lines: [line(1, ["불파게티로 변경"], 2), line(2, [], 1)] }),
      order({ id: 2, lines: [line(3, ["불파게티로 변경"], 1)] }),
    ]);

    expect(totals).toEqual([
      { menuId: 30, name: "짜파게티 (불파게티로 변경)", quantity: 3 },
      { menuId: 30, name: "짜파게티", quantity: 1 },
    ]);
  });
});
