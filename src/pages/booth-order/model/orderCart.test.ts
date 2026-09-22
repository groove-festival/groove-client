import { type BoothOrderDetail } from "@/entities/booth";

import {
  buildOrderLines,
  changeQuantity,
  createInitialCart,
  getOrderTotal,
  getQuantity,
  hasSelectedMenu,
} from "./orderCart";

const separateChargeItem = {
  id: "fee",
  name: "상차림비",
  description: "",
  price: 2_000,
  separateCharge: true,
};
const chicken = { id: "chicken", name: "닭발", description: "", price: 15_000 };
const cider = { id: "cider", name: "사이다", description: "", price: 2_000 };
const soldOut = {
  id: "sold-out",
  name: "계란말이",
  description: "",
  price: 6_500,
  isSoldOut: true,
};

const booth: BoothOrderDetail = {
  id: "booth",
  name: "주막 이름",
  description: "",
  collegeAndDepartment: "",
  menuImageUrl: null,
  menuSections: [
    { id: "main", title: "메인 메뉴", items: [chicken, soldOut] },
    { id: "beverage", title: "음료", items: [cider] },
  ],
  separateChargeItem,
  depositAccount: { bank: "국민", accountNumber: "000000-00-000000", holder: "홍길동" },
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
