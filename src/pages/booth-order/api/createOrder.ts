import { type ApiEnvelope, httpClient, requestData } from "@/shared/api";

import { type PlacedOrder } from "../model/order";
import { type OrderResponseBody, toPlacedOrder } from "./orderResponse";

export interface CreateOrderItem {
  menuId: number;
  optionIds?: number[];
  quantity: number;
}

export interface CreatedOrder {
  order: PlacedOrder;
  orderToken: string;
}

const randomUuidV4 = () => {
  const bytes = new Uint8Array(16);

  if (typeof crypto !== "undefined" && "getRandomValues" in crypto) {
    crypto.getRandomValues(bytes);
  } else {
    for (let index = 0; index < bytes.length; index += 1) {
      bytes[index] = Math.floor(Math.random() * 256);
    }
  }

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

export const createIdempotencyKey = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : randomUuidV4();

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
