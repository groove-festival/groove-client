import { type BoothMenuItem, type BoothOrderDetail } from "@/entities/booth";

import { type CreateOrderItem } from "../api/createOrder";
import { type OrderLine } from "./order";

// 메뉴 id별 담은 수량.
export type OrderCart = Record<number, number>;

// 메뉴 id별 체크한 옵션 id. 수량과 따로 두어 옵션이 없는 주막은 장바구니
// 모양이 바뀌지 않는다.
export type OrderOptionSelection = Record<number, number[]>;

// 장바구니에서 만든 주문 줄. 주문 요청에 보낼 옵션 id를 함께 들고 있다.
export interface CartLine extends OrderLine {
  optionIds: number[];
}

// 상차림비는 늘 0개로 시작하고, 손님이 직접 담는다. 안 담아도 주문할 수 있다.
// 첫 주문인지 추가 주문인지는 폰마다 따로 기억할 수밖에 없어, 같은 테이블 일행이
// 다른 폰으로 QR 을 찍으면 어긋난다. 그래서 판단은 서빙하는 직원이 테이블을 보고 한다.
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

// 수량을 0으로 내린 메뉴의 옵션은 지운다. 다시 담을 때 예전 체크가 살아 있으면
// 손님이 모르고 옵션을 붙인 채 주문한다.
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

// 상차림비를 제외한 메뉴를 하나라도 담았는지.
export const hasSelectedMenu = (booth: BoothOrderDetail, cart: OrderCart) =>
  booth.menuSections.some((section) =>
    section.items.some((item) => getQuantity(cart, item) > 0),
  );

// 상차림비를 하나라도 담았는지. 주문 조건이 아니라 안내 문구를 고르는 데만 쓴다.
export const hasSelectedSeparateCharge = (booth: BoothOrderDetail, cart: OrderCart) =>
  booth.separateChargeItems.length === 0 ||
  booth.separateChargeItems.some((item) => getQuantity(cart, item) > 0);

// 상차림비는 조건이 아니다 (createInitialCart 참고). 메뉴를 하나라도 담으면 주문한다.
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

    // 메뉴에 정의된 순서대로 담는다. 체크한 순서를 따르면 같은 주문이 손님마다
    // 다르게 적혀 주방에서 읽기 어렵다.
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
