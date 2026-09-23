import { z } from "zod";

// 로그인이 없으므로 주문 토큰이 곧 "내 주문"의 증명이다 (API 명세 §1.6). 같은
// 브라우저·같은 테이블에서 넣은 최근 주문 1건의 식별자와 토큰만 보관하고,
// 주문 내용은 매번 PUB-5로 다시 읽는다.
const ORDER_STORAGE_KEY_PREFIX = "groove:pub-order";

const storedOrderRefSchema = z.object({
  orderId: z.number().int().positive(),
  orderToken: z.string().min(1),
});

export type StoredOrderRef = z.infer<typeof storedOrderRefSchema>;

export const getOrderStorageKey = (boothCode: string, tableCode: string) =>
  `${ORDER_STORAGE_KEY_PREFIX}:${boothCode}:${tableCode}`;

export const readStoredOrderRef = (storageKey: string): StoredOrderRef | null => {
  try {
    const rawValue = window.localStorage.getItem(storageKey);

    if (!rawValue) {
      return null;
    }

    const result = storedOrderRefSchema.safeParse(JSON.parse(rawValue));
    return result.success ? result.data : null;
  } catch {
    return null;
  }
};

export const writeStoredOrderRef = (
  storageKey: string,
  orderRef: StoredOrderRef | null,
) => {
  try {
    if (orderRef) {
      window.localStorage.setItem(storageKey, JSON.stringify(orderRef));
    } else {
      window.localStorage.removeItem(storageKey);
    }
  } catch {
    // Storage can be unavailable in private or restricted browsing contexts.
  }
};
