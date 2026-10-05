import { type BoothMenuItem, type BoothOrderDetail } from "@/entities/booth";

import { type CreateOrderItem } from "../api/createOrder";
import { type OrderLine } from "./order";

export type OrderCart = Record<number, number>;

export type OrderOptionSelection = Record<number, number[]>;

export interface CartLine extends OrderLine {
  optionIds: number[];
}

export const createInitialCart = (): OrderCart => ({});

export const getQuantity = (cart: OrderCart, item: BoothMenuItem) => cart[item.id] ?? 0;

export const changeQuantity = (
  cart: OrderCart,
  item: BoothMenuItem,
  delta: number,
): OrderCart => {
  if (item.isSoldOut || item.price === null) {
    return cart;
  }

  const nextQuantity = Math.max(0, getQuantity(cart, item) + delta);
  return { ...cart, [item.id]: nextQuantity };
};

export const isOptionSelected = (
  selection: OrderOptionSelection,
  item: BoothMenuItem,
  optionId: number,
) => selection[item.id]?.includes(optionId) ?? false;

export const toggleOption = (
  selection: OrderOptionSelection,
  item: BoothMenuItem,
  optionId: number,
): OrderOptionSelection => {
  const current = selection[item.id] ?? [];
  const next = current.includes(optionId)
    ? current.filter((id) => id !== optionId)
    : [...current, optionId];

  return { ...selection, [item.id]: next };
};

export const clearOptions = (
  selection: OrderOptionSelection,
  item: BoothMenuItem,
): OrderOptionSelection => {
  if (!(item.id in selection)) {
    return selection;
  }

  return Object.fromEntries(
    Object.entries(selection).filter(([menuId]) => Number(menuId) !== item.id),
  );
};

const getOrderableItems = (booth: BoothOrderDetail) => [
  ...booth.separateChargeItems,
  ...booth.menuSections.flatMap((section) => section.items),
];

export const hasSelectedMenu = (booth: BoothOrderDetail, cart: OrderCart) =>
  booth.menuSections.some((section) =>
    section.items.some((item) => getQuantity(cart, item) > 0),
  );

export const hasSelectedSeparateCharge = (booth: BoothOrderDetail, cart: OrderCart) =>
  booth.separateChargeItems.length === 0 ||
  booth.separateChargeItems.some((item) => getQuantity(cart, item) > 0);

export const canPlaceOrder = (booth: BoothOrderDetail, cart: OrderCart) =>
  hasSelectedMenu(booth, cart);

export const buildOrderLines = (
  booth: BoothOrderDetail,
  cart: OrderCart,
  selection: OrderOptionSelection = {},
): CartLine[] =>
  getOrderableItems(booth).flatMap((item) => {
    const quantity = getQuantity(cart, item);

    if (quantity <= 0 || item.price === null) {
      return [];
    }

    const options = item.options.filter((option) =>
      isOptionSelected(selection, item, option.id),
    );
    const price = options.reduce(
      (unitPrice, option) => unitPrice + option.priceDelta,
      item.price,
    );

    return [
      {
        menuId: item.id,
        name: item.name,
        optionIds: options.map((option) => option.id),
        options: options.map(({ label, priceDelta }) => ({ label, priceDelta })),
        price,
        quantity,
      },
    ];
  });

export const toCreateOrderItems = (lines: CartLine[]): CreateOrderItem[] =>
  lines.map(({ menuId, optionIds, quantity }) =>
    optionIds.length ? { menuId, optionIds, quantity } : { menuId, quantity },
  );

export const getOrderTotal = (lines: OrderLine[]) =>
  lines.reduce((total, line) => total + line.price * line.quantity, 0);
