import { useQuery } from "@tanstack/react-query";

import { type ApiEnvelope, httpClient, requestData } from "@/shared/api";

import { type AdminOrder } from "../model/adminOrder";
import { type AdminOrderResponseBody, toAdminOrder } from "./adminOrderResponse";
import { pubAdminQueryKeys } from "./queryKeys";

export const ADMIN_ORDER_POLLING_INTERVAL_MS = 5_000;

export async function getAdminOrders(): Promise<AdminOrder[]> {
  const response = await requestData<AdminOrderResponseBody[]>(() =>
    httpClient.get<ApiEnvelope<AdminOrderResponseBody[]>>("/admin/pub/orders"),
  );

  return response.map(toAdminOrder);
}

export function useAdminOrders() {
  return useQuery({
    queryKey: pubAdminQueryKeys.orders(),
    queryFn: getAdminOrders,

    refetchInterval: ADMIN_ORDER_POLLING_INTERVAL_MS,
  });
}
