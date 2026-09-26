import { type ApiEnvelope, httpClient, requestData } from "@/shared/api";

import { type PlacedOrder } from "../model/order";
import { type OrderResponseBody, toPlacedOrder } from "./orderResponse";

export interface CreateOrderItem {
  menuId: number;
  quantity: number;
}

export interface CreatedOrder {
  order: PlacedOrder;
  orderToken: string;
}

// 서버는 Idempotency-Key 가 UUID 가 아니면 400(C001)으로 거부한다 (실서버
// 확인, 2026-09-25). crypto.randomUUID 는 보안 컨텍스트 + 비교적 최신
// 브라우저에서만 있으므로, 없는 환경에서도 UUID 모양을 지켜야 주문이 아예
// 성립한다. 예전 폴백은 `1727...-a3f9c2` 를 만들어 주문이 전부 실패했다.
const randomUuidV4 = () => {
  const bytes = new Uint8Array(16);

  if (typeof crypto !== "undefined" && "getRandomValues" in crypto) {
    crypto.getRandomValues(bytes);
  } else {
    for (let index = 0; index < bytes.length; index += 1) {
      bytes[index] = Math.floor(Math.random() * 256);
    }
  }

  // RFC 4122 의 버전(4)·variant 비트. 이게 없으면 UUID 형식 검사에 걸린다.
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;

  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");

  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    hex.slice(12, 16),
    hex.slice(16, 20),
    hex.slice(20),
  ].join("-");
};

const createIdempotencyKey = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : randomUuidV4();

// 같은 Idempotency-Key 로 다시 보내면 서버가 원래의 성공 응답을 그대로
// 재현한다. 더블탭이 에러로 보이면 접수된 주문을 실패로 오해한다 (§1.6).
export async function createOrder({
  boothCode,
  idempotencyKey = createIdempotencyKey(),
  items,
  tableCode,
}: {
  boothCode: string;
  idempotencyKey?: string;
  items: CreateOrderItem[];
  tableCode: string;
}): Promise<CreatedOrder> {
  const response = await requestData<OrderResponseBody>(() =>
    httpClient.post<ApiEnvelope<OrderResponseBody>>(
      `/pubs/${encodeURIComponent(boothCode)}/tables/${encodeURIComponent(tableCode)}/orders`,
      { items },
      { headers: { "Idempotency-Key": idempotencyKey } },
    ),
  );

  return { order: toPlacedOrder(response), orderToken: response.orderToken ?? "" };
}
