import { useQuery } from "@tanstack/react-query";

import { ApiError, type ApiEnvelope, httpClient, requestData } from "@/shared/api";

import { isOrderInProgress, type PlacedOrder } from "../model/order";
import { type OrderResponseBody, toPlacedOrder } from "./orderResponse";
import { orderQueryKeys } from "./queryKeys";

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
    queryFn: () => {
      if (!target) throw new ApiError("PUB008", "주문 정보를 확인할 수 없어요");
      return getOrder(target);
    },
    enabled: Boolean(target),

    refetchInterval: (query) =>
      isOrderInProgress(query.state.data ?? null) ? ORDER_POLLING_INTERVAL_MS : false,
    retry: false,
  });
}
