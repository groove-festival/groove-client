import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  type BoothMenuItem,
  type BoothMenuResponseBody,
  type MenuCategory,
  toBoothMenuItem,
} from "@/entities/booth";
import { type ApiEnvelope, httpClient, requestData } from "@/shared/api";

import { pubAdminQueryKeys } from "./queryKeys";

// PUB-A6은 부분 전송이다. 보내지 않은 항목은 기존 값이 유지되므로 품절 토글만
// 할 때 이름·가격을 함께 보내지 않는다. 사진은 여기서 바꾸지 않는다 (PUB-A12).
export interface UpdateMenuRequestBody {
  category?: MenuCategory;
  description?: string | null;
  name?: string;
  price?: number;
  separateCharge?: boolean;
  soldOut?: boolean;
}

export interface UpdateMenuArgs {
  menuId: number;
  requestBody: UpdateMenuRequestBody;
}

export async function updateMenu({
  menuId,
  requestBody,
}: UpdateMenuArgs): Promise<BoothMenuItem> {
  const response = await requestData<BoothMenuResponseBody>(() =>
    httpClient.patch<ApiEnvelope<BoothMenuResponseBody>>(
      `/admin/pub/menus/${menuId}`,
      requestBody,
    ),
  );

  return toBoothMenuItem(response);
}

export function useUpdateMenu() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateMenu,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: pubAdminQueryKeys.me() });
    },
  });
}
