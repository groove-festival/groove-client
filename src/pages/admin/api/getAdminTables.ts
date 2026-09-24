import { useQuery } from "@tanstack/react-query";

import { type ApiEnvelope, httpClient, requestData } from "@/shared/api";

import { pubAdminQueryKeys } from "./queryKeys";

export interface AdminTable {
  // 서비스 루트 기준 상대 경로. QR에 실을 절대 URL은 프론트가 완성한다.
  orderPath: string;
  tableCode: string;
  tableNumber: number;
}

// PUB-A11. QR 발급용. 테이블 코드는 서버가 예측 불가능한 랜덤 문자열로
// 발급하므로(FR-1.3) 프론트가 만들거나 추측하지 않는다.
export async function getAdminTables(): Promise<AdminTable[]> {
  return requestData(() =>
    httpClient.get<ApiEnvelope<AdminTable[]>>("/admin/pub/tables"),
  );
}

export function useAdminTables() {
  return useQuery({
    queryKey: pubAdminQueryKeys.tables(),
    queryFn: getAdminTables,
  });
}
