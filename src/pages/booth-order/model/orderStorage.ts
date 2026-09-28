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

// 이 기기가 이 테이블에서 이미 주문을 끝냈는지. "추가 주문하기"를 누를 때
// 남기고, 있으면 다음 주문부터 상차림비를 강제로 담지 않는다.
//
// 서버의 테이블 주문 이력으로 판단하지 않는 이유: 축제 동안 한 테이블에 여러
// 일행이 번갈아 앉는다. 앞 일행의 주문을 근거로 새 일행의 상차림비를 빼면 안
// 된다. 같은 기기라도 몇 시간 뒤면 다른 방문이라 기한을 둔다.
const ADDITIONAL_ORDER_KEY_PREFIX = "groove:pub-order-additional";
export const ADDITIONAL_ORDER_TTL_MS = 6 * 60 * 60 * 1000;

export const getAdditionalOrderStorageKey = (boothCode: string, tableCode: string) =>
  `${ADDITIONAL_ORDER_KEY_PREFIX}:${boothCode}:${tableCode}`;

export const readAdditionalOrderMark = (
  storageKey: string,
  now = Date.now(),
): boolean => {
  try {
    const markedAt = Number(window.localStorage.getItem(storageKey));

    return (
      Number.isFinite(markedAt) &&
      markedAt > 0 &&
      now - markedAt < ADDITIONAL_ORDER_TTL_MS
    );
  } catch {
    return false;
  }
};

export const writeAdditionalOrderMark = (storageKey: string, now = Date.now()) => {
  try {
    window.localStorage.setItem(storageKey, String(now));
  } catch {
    // 저장하지 못해도 이번 화면에서는 추가 주문으로 동작한다.
  }
};
