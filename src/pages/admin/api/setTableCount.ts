import { useMutation, useQueryClient } from "@tanstack/react-query";

import { type ApiEnvelope, httpClient, requestData } from "@/shared/api";

import { type AdminTable } from "./getAdminTables";
import { pubAdminQueryKeys } from "./queryKeys";

export interface SetTableCountRequestBody {
  count: number;
}

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
