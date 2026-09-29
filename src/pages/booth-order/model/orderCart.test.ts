import { type BoothMenuItem, type BoothOrderDetail } from "@/entities/booth";

import {
  buildOrderLines,
  canPlaceOrder,
  changeQuantity,
  clearOptions,
  createInitialCart,
  getOrderTotal,
  getQuantity,
  hasSelectedMenu,
  hasSelectedSeparateCharge,
  toCreateOrderItems,
  toggleOption,
} from "./orderCart";

const createMenuItem = (
  item: Pick<BoothMenuItem, "id" | "name" | "price"> & Partial<BoothMenuItem>,
): BoothMenuItem => ({
  category: "MAIN",
  description: "",
  imageUrl: null,
  isSoldOut: false,
  options: [],
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
  separateChargeItems: [separateChargeItem],
};

describe("orderCart", () => {
  it("starts with one separate charge and no selected menu", () => {
    const cart = createInitialCart(booth);

    expect(getQuantity(cart, separateChargeItem)).toBe(1);
    expect(getQuantity(cart, chicken)).toBe(0);
    expect(hasSelectedMenu(booth, cart)).toBe(false);
  });

  it("leaves the separate charge out of an additional order, but lets it be added back", () => {
    let cart = createInitialCart(booth, true);

    expect(getQuantity(cart, separateChargeItem)).toBe(0);
    cart = changeQuantity(cart, chicken, 1);
    expect(canPlaceOrder(booth, cart)).toBe(true);

    cart = changeQuantity(cart, separateChargeItem, 1);
    cart = changeQuantity(cart, separateChargeItem, -1);
    expect(getQuantity(cart, separateChargeItem)).toBe(0);
  });

  it("lets the customer take the separate charge out, down to zero", () => {
    // 같은 테이블 일행이 다른 폰으로 이미 냈을 수 있다.
    let cart = createInitialCart(booth);
    cart = changeQuantity(cart, separateChargeItem, -1);
    cart = changeQuantity(cart, separateChargeItem, -1);
    cart = changeQuantity(cart, chicken, -1);

    expect(getQuantity(cart, separateChargeItem)).toBe(0);
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

  it("orders a menu without the separate charge once the customer takes it out", () => {
    let cart = changeQuantity(createInitialCart(booth), chicken, 1);
    expect(hasSelectedSeparateCharge(booth, cart)).toBe(true);

    cart = changeQuantity(cart, separateChargeItem, -1);
    expect(hasSelectedSeparateCharge(booth, cart)).toBe(false);
    expect(canPlaceOrder(booth, cart)).toBe(true);
  });
});

describe("orderCart with several separate charges", () => {
  const perPerson = createMenuItem({
    category: "SIDE",
    description: "1인",
    id: 20,
    name: "상차림비 (1인)",
    price: 2_000,
    separateCharge: true,
  });
  const perTable = createMenuItem({
    category: "SIDE",
    description: "3인 이상, 테이블당",
    id: 21,
    name: "상차림비 (테이블)",
    price: 5_000,
    separateCharge: true,
  });
  const jointBooth: BoothOrderDetail = {
    ...booth,
    separateChargeItems: [perPerson, perTable],
  };

  it("starts every separate charge at zero and lets them go back to zero", () => {
    let cart = createInitialCart(jointBooth);

    expect(getQuantity(cart, perPerson)).toBe(0);
    expect(getQuantity(cart, perTable)).toBe(0);

    cart = changeQuantity(cart, perPerson, 1);
    cart = changeQuantity(cart, perPerson, -1);
    cart = changeQuantity(cart, perPerson, -1);

    expect(getQuantity(cart, perPerson)).toBe(0);
  });

  it("needs only a menu before ordering, with or without a separate charge", () => {
    let cart = changeQuantity(createInitialCart(jointBooth), chicken, 1);

    expect(hasSelectedMenu(jointBooth, cart)).toBe(true);
    expect(hasSelectedSeparateCharge(jointBooth, cart)).toBe(false);
    expect(canPlaceOrder(jointBooth, cart)).toBe(true);

    cart = changeQuantity(cart, perTable, 1);
    expect(hasSelectedSeparateCharge(jointBooth, cart)).toBe(true);

    // 상차림비만 담고 메뉴가 없으면 여전히 주문할 수 없다.
    cart = changeQuantity(cart, chicken, -1);
    expect(canPlaceOrder(jointBooth, cart)).toBe(false);
  });

  it("puts every chosen separate charge first in the order lines", () => {
    let cart = createInitialCart(jointBooth);
    cart = changeQuantity(cart, chicken, 1);
    cart = changeQuantity(cart, perTable, 1);
    cart = changeQuantity(cart, perPerson, 2);

    expect(
      buildOrderLines(jointBooth, cart).map((line) => [line.name, line.quantity]),
    ).toEqual([
      ["상차림비 (1인)", 2],
      ["상차림비 (테이블)", 1],
      ["닭발", 1],
    ]);
  });
});

describe("orderCart options", () => {
  const upgrade = { id: 31, label: "불파게티로 변경", priceDelta: 1_000 };
  const comboDiscount = {
    id: 32,
    label: "메인 메뉴와 함께 주문했어요",
    priceDelta: -1_000,
  };
  const noodles = createMenuItem({
    id: 30,
    name: "짜파게티",
    options: [upgrade, comboDiscount],
    price: 5_000,
  });
  const optionBooth: BoothOrderDetail = {
    ...booth,
    menuSections: [{ id: "main", title: "메인 메뉴", items: [chicken, noodles] }],
  };

  it("adds the ticked deltas to the unit price for the whole line", () => {
    let cart = createInitialCart(optionBooth);
    cart = changeQuantity(cart, noodles, 1);
    cart = changeQuantity(cart, noodles, 1);
    const selection = toggleOption({}, noodles, upgrade.id);

    const lines = buildOrderLines(optionBooth, cart, selection);

    expect(lines[1]).toEqual({
      menuId: 30,
      name: "짜파게티",
      optionIds: [31],
      options: [{ label: "불파게티로 변경", priceDelta: 1_000 }],
      price: 6_000,
      quantity: 2,
    });
    expect(getOrderTotal(lines)).toBe(2_000 + 6_000 * 2);
  });

  it("nets out a discount and keeps the menu's option order", () => {
    const cart = changeQuantity(createInitialCart(optionBooth), noodles, 1);
    let selection = toggleOption({}, noodles, comboDiscount.id);
    selection = toggleOption(selection, noodles, upgrade.id);

    const [, line] = buildOrderLines(optionBooth, cart, selection);

    expect(line.optionIds).toEqual([31, 32]);
    expect(line.price).toBe(5_000);

    // 다시 누르면 해제된다.
    selection = toggleOption(selection, noodles, upgrade.id);
    expect(buildOrderLines(optionBooth, cart, selection)[1].price).toBe(4_000);
  });

  it("sends option ids only for lines that have them", () => {
    let cart = createInitialCart(optionBooth);
    cart = changeQuantity(cart, noodles, 1);
    cart = changeQuantity(cart, chicken, 1);
    const selection = toggleOption({}, noodles, comboDiscount.id);

    expect(toCreateOrderItems(buildOrderLines(optionBooth, cart, selection))).toEqual([
      { menuId: 14, quantity: 1 },
      { menuId: 4, quantity: 1 },
      { menuId: 30, optionIds: [32], quantity: 1 },
    ]);
  });

  it("clears the options of a menu taken back out of the cart", () => {
    const selection = toggleOption(toggleOption({}, noodles, upgrade.id), chicken, 99);

    expect(clearOptions(selection, noodles)).toEqual({ 4: [99] });
    expect(clearOptions({}, noodles)).toEqual({});
  });
});
