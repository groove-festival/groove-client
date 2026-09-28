import { useMutation, useQueryClient } from "@tanstack/react-query";

import { type ApiEnvelope, httpClient, requestData } from "@/shared/api";

import { type AdminOrder } from "../model/adminOrder";
import { type AdminOrderResponseBody, toAdminOrder } from "./adminOrderResponse";
import { pubAdminQueryKeys } from "./queryKeys";

export interface ChangeOrderItemServedArgs {
  itemId: number;
  orderId: number;
  served: boolean;
}

export interface ChangeOrderItemServedRequestBody {
  served: boolean;
}

// PUB-A14. 조리 중(PAID) 주문의 항목 하나를 서빙 체크한다. 마지막 항목까지
// 체크되면 서버가 주문을 COMPLETED로 올려 응답한다.
export async function changeOrderItemServed({
  itemId,
  orderId,
  served,
}: ChangeOrderItemServedArgs): Promise<AdminOrder> {
  const response = await requestData<AdminOrderResponseBody>(() =>
    httpClient.patch<ApiEnvelope<AdminOrderResponseBody>>(
      `/admin/pub/orders/${orderId}/items/${itemId}/served`,
      { served } satisfies ChangeOrderItemServedRequestBody,
    ),
  );

  return toAdminOrder(response);
}

// 주방에서 연달아 누르는 버튼이라 5초 폴링을 기다리지 않고 바로 반영한다.
// 서버가 거절하면 이전 목록으로 되돌리고 다시 받아온다.
export function useChangeOrderItemServed() {
  const queryClient = useQueryClient();
  const queryKey = pubAdminQueryKeys.orders();

  return useMutation({
    mutationFn: changeOrderItemServed,
    onMutate: async ({ itemId, orderId, served }) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<AdminOrder[]>(queryKey);
      const now = new Date().toISOString();

      queryClient.setQueryData<AdminOrder[]>(queryKey, (orders) =>
        orders?.map((order) =>
          order.id !== orderId
            ? order
            : {
                ...order,
                lines: order.lines.map((line) =>
                  line.itemId === itemId
                    ? { ...line, servedAt: served ? (line.servedAt ?? now) : null }
                    : line,
                ),
              },
        ),
      );

      return { previous };
    },
    onError: (_error, _args, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKey, context.previous);
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey });
    },
  });
}
