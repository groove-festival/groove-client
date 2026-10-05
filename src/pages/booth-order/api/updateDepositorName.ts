import { type ApiEnvelope, httpClient, requestData } from "@/shared/api";

import { type PlacedOrder } from "../model/order";
import { buildOrderPath, type OrderRequestTarget } from "./getOrder";
import { type OrderResponseBody, toPlacedOrder } from "./orderResponse";

export async function updateDepositorName(
  target: OrderRequestTarget,
  depositorName: string,
): Promise<PlacedOrder> {
  const response = await requestData<OrderResponseBody>(() =>
    httpClient.put<ApiEnvelope<OrderResponseBody>>(
      `${buildOrderPath(target)}/depositor-name`,
      { depositorName },
      { headers: { "X-Order-Token": target.orderToken } },
    ),
  );

  return toPlacedOrder(response);
}
