import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  type BoothMenuItem,
  type BoothMenuResponseBody,
  type MenuCategory,
  toBoothMenuItem,
} from "@/entities/booth";
import { type ApiEnvelope, httpClient, requestData } from "@/shared/api";

import { pubAdminQueryKeys } from "./queryKeys";

export interface CreateMenuRequestBody {
  category: MenuCategory;
  description: string | null;
  name: string;

  options?: { label: string; priceDelta: number }[];
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
