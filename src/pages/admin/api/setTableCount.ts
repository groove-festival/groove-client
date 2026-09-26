import { useMutation, useQueryClient } from "@tanstack/react-query";

import { type ApiEnvelope, httpClient, requestData } from "@/shared/api";

import { type AdminTable } from "./getAdminTables";
import { pubAdminQueryKeys } from "./queryKeys";

export interface SetTableCountRequestBody {
  count: number;
}

// PUB-A10. 개수를 보내면 서버가 1번부터 그 수만큼 만든다. 주막 테이블은
// "1번부터 N번" 연번이라 건별 등록은 같은 입력을 N번 반복시킬 뿐이다.
// 주문이 들어온 테이블이 잘리는 축소는 서버가 409(PUB009)로 막는다.
export async function setTableCount(count: number): Promise<AdminTable[]> {
  return requestData(() =>
    httpClient.put<ApiEnvelope<AdminTable[]>>("/admin/pub/tables", { count }),
  );
}

export function useSetTableCount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: setTableCount,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: pubAdminQueryKeys.tables() });
    },
  });
}
