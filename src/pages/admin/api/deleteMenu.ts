import { useMutation, useQueryClient } from "@tanstack/react-query";

import { type ApiEnvelope, httpClient, requestVoid } from "@/shared/api";

import { pubAdminQueryKeys } from "./queryKeys";

// PUB-A7. 이미 주문에 포함된 메뉴를 지워도 과거 주문 표시는 깨지지 않는다 —
// 주문 항목이 주문 시점의 메뉴명·가격을 스냅샷으로 들고 있다.
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
