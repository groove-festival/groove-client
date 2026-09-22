import { z } from "zod";

import { type PlacedOrder } from "./order";

// 주문 API 연동 전까지 쓰는 목 저장소. 같은 브라우저·같은 테이블에서 넣은
// 최근 주문 1건을 보관한다. API 연동 후에는 주문 토큰 저장소로 대체한다.
const ORDER_STORAGE_KEY_PREFIX = "groove:pub-order";

const placedOrderSchema = z.object({
  depositorName: z.string().nullable(),
  id: z.string(),
  lines: z.array(
    z.object({
      menuId: z.string(),
      name: z.string(),
      price: z.number(),
      quantity: z.number().int().positive(),
    }),
  ),
  paymentMethod: z.enum(["TRANSFER", "CASH"]),
  status: z.enum(["PENDING_DEPOSIT", "DEPOSIT_CLAIMED", "PAID", "COMPLETED"]),
  totalPrice: z.number(),
});

export const getOrderStorageKey = (boothId: string, tableCode: string) =>
  `${ORDER_STORAGE_KEY_PREFIX}:${boothId}:${tableCode}`;

export const readStoredOrder = (storageKey: string): PlacedOrder | null => {
  try {
    const rawValue = window.localStorage.getItem(storageKey);

    if (!rawValue) {
      return null;
    }

    const result = placedOrderSchema.safeParse(JSON.parse(rawValue));
    return result.success ? result.data : null;
  } catch {
    return null;
  }
};

export const writeStoredOrder = (storageKey: string, order: PlacedOrder | null) => {
  try {
    if (order) {
      window.localStorage.setItem(storageKey, JSON.stringify(order));
    } else {
      window.localStorage.removeItem(storageKey);
    }
  } catch {
    // Storage can be unavailable in private or restricted browsing contexts.
  }
};
