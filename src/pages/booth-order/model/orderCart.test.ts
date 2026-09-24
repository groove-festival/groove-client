import { type BoothMenuItem, type BoothOrderDetail } from "@/entities/booth";

import {
  buildOrderLines,
  changeQuantity,
  createInitialCart,
  getOrderTotal,
  getQuantity,
  hasSelectedMenu,
} from "./orderCart";

const createMenuItem = (
  item: Pick<BoothMenuItem, "id" | "name" | "price"> & Partial<BoothMenuItem>,
): BoothMenuItem => ({
  category: "MAIN",
  description: "",
  imageUrl: null,
  isSoldOut: false,
  separateCharge: false,
  ...item,
});

const separateChargeItem = createMenuItem({
  category: "SIDE",
  id: 14,
  name: "상차림비",
  price: 2_000,
  separateCharge: true,
});
const chicken = createMenuItem({ id: 4, name: "닭발", price: 15_000 });
const cider = createMenuItem({
  category: "DRINK",
  id: 12,
  name: "사이다",
  price: 2_000,
});
const soldOut = createMenuItem({
  category: "SIDE",
  id: 8,
  isSoldOut: true,
  name: "계란말이",
  price: 6_500,
});

const booth: BoothOrderDetail = {
  area: null,
  boothCode: "booth",
  colleges: ["IT"],
  departments: ["테스트학과"],
  name: "주막 이름",
  description: "",
  status: "OPEN",
  xRatio: null,
  yRatio: null,
  menuBoardImageUrl: null,
  menuSections: [
    { id: "main", title: "메인 메뉴", items: [chicken, soldOut] },
    { id: "beverage", title: "음료", items: [cider] },
  ],
  separateChargeItem,
};

describe("orderCart", () => {
  it("starts with one separate charge and no selected menu", () => {
    const cart = createInitialCart(booth);

    expect(getQuantity(cart, separateChargeItem)).toBe(1);
    expect(getQuantity(cart, chicken)).toBe(0);
    expect(hasSelectedMenu(booth, cart)).toBe(false);
  });

  it("keeps the separate charge at one or more and menus at zero or more", () => {
    let cart = createInitialCart(booth);
    cart = changeQuantity(cart, separateChargeItem, -1);
    cart = changeQuantity(cart, chicken, -1);

    expect(getQuantity(cart, separateChargeItem)).toBe(1);
    expect(getQuantity(cart, chicken)).toBe(0);
  });

  it("ignores quantity changes for sold-out menus", () => {
    const cart = changeQuantity(createInitialCart(booth), soldOut, 1);

    expect(getQuantity(cart, soldOut)).toBe(0);
  });

  it("builds order lines with the separate charge first and sums the total", () => {
    let cart = createInitialCart(booth);
    cart = changeQuantity(cart, cider, 1);
    cart = changeQuantity(cart, chicken, 1);
    cart = changeQuantity(cart, chicken, 1);

    const lines = buildOrderLines(booth, cart);

    expect(hasSelectedMenu(booth, cart)).toBe(true);
    expect(lines.map((line) => [line.name, line.quantity])).toEqual([
      ["상차림비", 1],
      ["닭발", 2],
      ["사이다", 1],
    ]);
    expect(getOrderTotal(lines)).toBe(2_000 + 30_000 + 2_000);
  });
});
