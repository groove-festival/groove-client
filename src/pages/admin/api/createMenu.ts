import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  type BoothMenuItem,
  type BoothMenuResponseBody,
  type MenuCategory,
  toBoothMenuItem,
} from "@/entities/booth";
import { type ApiEnvelope, httpClient, requestData } from "@/shared/api";

import { pubAdminQueryKeys } from "./queryKeys";

// 분류는 필수다. 비면 손님 화면에서 어느 묶음에도 들어가지 못하는 메뉴가
// 생기므로 등록 시점에 받는다 (PUB-A5). 품절 여부는 등록 시 기본 판매중이라
// 보내지 않는다.
export interface CreateMenuRequestBody {
  category: MenuCategory;
  description: string | null;
  name: string;
  price: number;
  separateCharge: boolean;
}

export async function createMenu(
  requestBody: CreateMenuRequestBody,
): Promise<BoothMenuItem> {
  const response = await requestData<BoothMenuResponseBody>(() =>
    httpClient.post<ApiEnvelope<BoothMenuResponseBody>>(
      "/admin/pub/menus",
      requestBody,
    ),
  );

  return toBoothMenuItem(response);
}

export function useCreateMenu() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createMenu,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: pubAdminQueryKeys.me() });
    },
  });
}
