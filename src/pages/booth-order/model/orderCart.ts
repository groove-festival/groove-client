import { type BoothMenuItem, type BoothOrderDetail } from "@/entities/booth";

import { type OrderLine } from "./order";

// 메뉴 id별 담은 수량.
export type OrderCart = Record<number, number>;

// 상차림비는 모든 주문에 붙는 항목이라 1 아래로 내릴 수 없다.
export const getMinimumQuantity = (item: BoothMenuItem) =>
  item.separateCharge ? 1 : 0;

export const createInitialCart = (booth: BoothOrderDetail): OrderCart =>
  booth.separateChargeItem ? { [booth.separateChargeItem.id]: 1 } : {};

export const getQuantity = (cart: OrderCart, item: BoothMenuItem) =>
  cart[item.id] ?? getMinimumQuantity(item);

export const changeQuantity = (
  cart: OrderCart,
  item: BoothMenuItem,
  delta: number,
): OrderCart => {
  if (item.isSoldOut || item.price === null) {
    return cart;
  }

  const nextQuantity = Math.max(
    getMinimumQuantity(item),
    getQuantity(cart, item) + delta,
  );
  return { ...cart, [item.id]: nextQuantity };
};

const getOrderableItems = (booth: BoothOrderDetail) => [
  ...(booth.separateChargeItem ? [booth.separateChargeItem] : []),
  ...booth.menuSections.flatMap((section) => section.items),
];

// 상차림비를 제외한 메뉴를 하나라도 담았을 때만 주문할 수 있다.
export const hasSelectedMenu = (booth: BoothOrderDetail, cart: OrderCart) =>
  booth.menuSections.some((section) =>
    section.items.some((item) => getQuantity(cart, item) > 0),
  );

export const buildOrderLines = (
  booth: BoothOrderDetail,
  cart: OrderCart,
): OrderLine[] =>
  getOrderableItems(booth).flatMap((item) => {
    const quantity = getQuantity(cart, item);

    if (quantity <= 0 || item.price === null) {
      return [];
    }

    return [{ menuId: item.id, name: item.name, price: item.price, quantity }];
  });

export const getOrderTotal = (lines: OrderLine[]) =>
  lines.reduce((total, line) => total + line.price * line.quantity, 0);
