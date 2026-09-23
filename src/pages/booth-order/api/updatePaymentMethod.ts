import { type ApiEnvelope, httpClient, requestData } from "@/shared/api";

import { type PaymentMethod, type PlacedOrder } from "../model/order";
import { buildOrderPath, type OrderRequestTarget } from "./getOrder";
import { type OrderResponseBody, toPlacedOrder } from "./orderResponse";

// 결제수단 선언은 표식일 뿐 주문 상태를 바꾸지 않는다 (FR-1.4-6). 결제완료로
// 올리는 것은 관리자가 실물 현금·입금 내역을 확인한 뒤에 한다.
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
