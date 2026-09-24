import { useQuery } from "@tanstack/react-query";

import { ApiError, type ApiEnvelope, httpClient, requestData } from "@/shared/api";
import {
  type BoothDetailResponseBody,
  type BoothOrderDetail,
  createBoothOrderMenus,
  toBoothMenuItem,
} from "@/entities/booth";

import { orderQueryKeys } from "./queryKeys";

// PUB-3 응답은 PUB-2 페이로드를 통째로 품고 있어 pub이 두 번 중첩된다.
interface OrderTableResponseBody {
  orderable: boolean;
  pub: BoothDetailResponseBody;
  tableCode: string;
  tableNumber: number;
}

export interface OrderTable {
  booth: BoothOrderDetail;
  isOrderable: boolean;
  tableNumber: number;
}

// 없는 부스(PUB002)와 없는 테이블(PUB003)을 구분해 안내하지 않는다. 구분하면
// 테이블 코드를 찍어보며 존재 여부를 알아낼 수 있다 (API 명세 PUB-3).
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
