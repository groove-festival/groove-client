import { useQuery } from "@tanstack/react-query";

import { type ApiEnvelope, httpClient, requestData } from "@/shared/api";

import { isOrderInProgress, type PlacedOrder } from "../model/order";
import { type OrderResponseBody, toPlacedOrder } from "./orderResponse";
import { orderQueryKeys } from "./queryKeys";

// 관리자 주문 리스트(PUB-A8)와 같은 주기. 관리자가 결제완료로 올린 것을 손님
// 화면이 따라가야 하고(FR-1.6), 취소도 이 경로로 전달된다.
export const ORDER_POLLING_INTERVAL_MS = 5_000;

export interface OrderRequestTarget {
  boothCode: string;
  orderId: number;
  orderToken: string;
  tableCode: string;
}

export const buildOrderPath = ({
  boothCode,
  orderId,
  tableCode,
}: Pick<OrderRequestTarget, "boothCode" | "orderId" | "tableCode">) =>
  `/pubs/${encodeURIComponent(boothCode)}/tables/${encodeURIComponent(tableCode)}/orders/${orderId}`;

export async function getOrder(target: OrderRequestTarget): Promise<PlacedOrder> {
  const response = await requestData<OrderResponseBody>(() =>
    httpClient.get<ApiEnvelope<OrderResponseBody>>(buildOrderPath(target), {
      headers: { "X-Order-Token": target.orderToken },
    }),
  );

  return toPlacedOrder(response);
}

export function useOrder(target: OrderRequestTarget | null) {
  return useQuery({
    queryKey: orderQueryKeys.order(
      target?.boothCode ?? "",
      target?.tableCode ?? "",
      target?.orderId ?? 0,
    ),
    queryFn: () => getOrder(target as OrderRequestTarget),
    enabled: Boolean(target),
    // 완료·취소된 주문은 더 바뀌지 않으므로 폴링을 멈춘다.
    refetchInterval: (query) =>
      isOrderInProgress(query.state.data ?? null) ? ORDER_POLLING_INTERVAL_MS : false,
    retry: false,
  });
}
