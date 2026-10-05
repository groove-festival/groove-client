import { useQuery } from "@tanstack/react-query";

import { type ApiEnvelope, httpClient, requestData } from "@/shared/api";

import { pubAdminQueryKeys } from "./queryKeys";

export interface AdminTable {
  orderPath: string;
  tableCode: string;
  tableNumber: number;
}

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
