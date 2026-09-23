import { type ApiEnvelope, httpClient, requestData } from "@/shared/api";

import { type PlacedOrder } from "../model/order";
import { buildOrderPath, type OrderRequestTarget } from "./getOrder";
import { type OrderResponseBody, toPlacedOrder } from "./orderResponse";

// 제출하면 서버가 입금대기 → 입금확인중으로 자동 전환한다 (FR-1.4-2).
// 관리자가 결제완료로 올리기 전까지는 재제출로 수정할 수 있다.
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
