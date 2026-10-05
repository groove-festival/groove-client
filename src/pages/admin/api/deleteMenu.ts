import { useMutation, useQueryClient } from "@tanstack/react-query";

import { type ApiEnvelope, httpClient, requestVoid } from "@/shared/api";

import { pubAdminQueryKeys } from "./queryKeys";

export async function deleteMenu(menuId: number): Promise<void> {
  await requestVoid(() =>
    httpClient.delete<ApiEnvelope<unknown>>(`/admin/pub/menus/${menuId}`),
  );
}

export function useDeleteMenu() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteMenu,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: pubAdminQueryKeys.me() });
    },
  });
}
