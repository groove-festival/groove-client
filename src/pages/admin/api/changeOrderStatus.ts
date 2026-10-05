import { useMutation, useQueryClient } from "@tanstack/react-query";

import { type ApiEnvelope, httpClient, requestData } from "@/shared/api";

import { type AdminOrder, type AdminOrderStatus } from "../model/adminOrder";
import { type AdminOrderResponseBody, toAdminOrder } from "./adminOrderResponse";
import { pubAdminQueryKeys } from "./queryKeys";

export interface ChangeOrderStatusArgs {
  orderId: number;
  status: AdminOrderStatus;
}

export async function changeOrderStatus({
  orderId,
  status,
}: ChangeOrderStatusArgs): Promise<AdminOrder> {
  const response = await requestData<AdminOrderResponseBody>(() =>
    httpClient.patch<ApiEnvelope<AdminOrderResponseBody>>(
      `/admin/pub/orders/${orderId}/status`,
      { status },
    ),
  );

  return toAdminOrder(response);
}

export function useChangeOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: changeOrderStatus,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: pubAdminQueryKeys.orders() });
    },
  });
}
