import { useMutation, useQueryClient } from "@tanstack/react-query";

import { type ApiEnvelope, httpClient, requestData } from "@/shared/api";

import { type AdminOrder, type AdminOrderStatus } from "../model/adminOrder";
import { type AdminOrderResponseBody, toAdminOrder } from "./adminOrderResponse";
import { pubAdminQueryKeys } from "./queryKeys";

export interface ChangeOrderStatusArgs {
  orderId: number;
  status: AdminOrderStatus;
}

// PUB-A9. 허용 전이는 model/adminOrder의 전이표와 같다. 손님이 CASH로 선언해
// 뒀어도 관리자가 현금을 받은 뒤 직접 PAID로 올린다 — 선언은 자동 전이를
// 일으키지 않는다.
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
