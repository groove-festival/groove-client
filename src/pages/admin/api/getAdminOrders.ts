import { useQuery } from "@tanstack/react-query";

import { type ApiEnvelope, httpClient, requestData } from "@/shared/api";

import { type AdminOrder } from "../model/adminOrder";
import { type AdminOrderResponseBody, toAdminOrder } from "./adminOrderResponse";
import { pubAdminQueryKeys } from "./queryKeys";

// 실시간 갱신은 폴링 5초로 통일한다 (API 명세 §1.6). 손님 화면(PUB-5)과 같은
// 주기라 관리자가 올린 상태가 한 주기 안에 양쪽에 반영된다.
export const ADMIN_ORDER_POLLING_INTERVAL_MS = 5_000;

// 상태 필터는 쓰지 않고 전량을 받아 화면에서 가른다. 상태별로 나눠 요청하면
// 5초마다 5요청이 되고, 결제 확인 전·후를 한 화면에서 보여줘야 하므로(FR-1.8-2)
// 어차피 전 상태가 필요하다.
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
    // 손님 주문은 종료 상태가 있어도 계속 새로 들어오므로 폴링을 멈추지 않는다.
    refetchInterval: ADMIN_ORDER_POLLING_INTERVAL_MS,
  });
}
