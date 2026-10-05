import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  type BoothMenuItem,
  type BoothMenuResponseBody,
  type MenuCategory,
  toBoothMenuItem,
} from "@/entities/booth";
import { type ApiEnvelope, httpClient, requestData } from "@/shared/api";

import { pubAdminQueryKeys } from "./queryKeys";

export interface UpdateMenuRequestBody {
  category?: MenuCategory;
  description?: string | null;
  name?: string;

  options?: { label: string; priceDelta: number }[];
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
