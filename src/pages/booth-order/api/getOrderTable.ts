import { useQuery } from "@tanstack/react-query";

import { ApiError, type ApiEnvelope, httpClient, requestData } from "@/shared/api";
import {
  type BoothDetailResponseBody,
  type BoothOrderDetail,
  createBoothOrderMenus,
  toBoothMenuItem,
} from "@/entities/booth";

import { orderQueryKeys } from "./queryKeys";

interface OrderTableResponseBody {
  orderable: boolean;
  pub: BoothDetailResponseBody;
  tableCode: string;
  tableNumber: number;
}

export interface OrderTable {
  booth: BoothOrderDetail;
  isOrderable: boolean;

  tableCode: string;
  tableNumber: number;
}

export function isOrderTableNotFound(error: unknown): boolean {
  return (
    error instanceof ApiError && (error.code === "PUB002" || error.code === "PUB003")
  );
}

export async function getOrderTable(
  boothCode: string,
  tableCode: string,
): Promise<OrderTable> {
  const response = await requestData<OrderTableResponseBody>(() =>
    httpClient.get<ApiEnvelope<OrderTableResponseBody>>(
      `/pubs/${encodeURIComponent(boothCode)}/tables/${encodeURIComponent(tableCode)}`,
    ),
  );

  const { menuBoardImageUrl, menus, pub } = response.pub;

  return {
    booth: {
      ...pub,
      menuBoardImageUrl,
      ...createBoothOrderMenus(menus.map(toBoothMenuItem)),
    },
    isOrderable: response.orderable,
    tableCode: response.tableCode,
    tableNumber: response.tableNumber,
  };
}

export function useOrderTable(
  boothCode: string | undefined,
  tableCode: string | undefined,
) {
  return useQuery({
    queryKey: orderQueryKeys.table(boothCode ?? "", tableCode ?? ""),
    queryFn: () => getOrderTable(boothCode ?? "", tableCode ?? ""),
    enabled: Boolean(boothCode && tableCode),
    retry: (failureCount, error) => !isOrderTableNotFound(error) && failureCount < 1,
  });
}
