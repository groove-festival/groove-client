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
