import { type ApiEnvelope, httpClient, requestData } from "@/shared/api";

import { type PaymentMethod, type PlacedOrder } from "../model/order";
import { buildOrderPath, type OrderRequestTarget } from "./getOrder";
import { type OrderResponseBody, toPlacedOrder } from "./orderResponse";

export async function updatePaymentMethod(
  target: OrderRequestTarget,
  paymentMethod: PaymentMethod,
): Promise<PlacedOrder> {
  const response = await requestData<OrderResponseBody>(() =>
    httpClient.put<ApiEnvelope<OrderResponseBody>>(
      `${buildOrderPath(target)}/payment-method`,
      { paymentMethod },
      { headers: { "X-Order-Token": target.orderToken } },
    ),
  );

  return toPlacedOrder(response);
}
