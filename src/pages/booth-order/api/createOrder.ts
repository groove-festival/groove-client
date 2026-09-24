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

const createIdempotencyKey = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

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
