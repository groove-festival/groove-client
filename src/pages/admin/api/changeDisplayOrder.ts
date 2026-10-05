import { useMutation, useQueryClient } from "@tanstack/react-query";

import { type ApiEnvelope, httpClient, requestData } from "@/shared/api";

import type { AdminSongRequest } from "./getSongRequests";
import { promoAdminQueryKeys } from "./queryKeys";

export interface DisplayOrderResult {
  totalCount: number;

  songs: AdminSongRequest[];
}

export async function changeDisplayOrder(
  songRequestIds: number[],
): Promise<DisplayOrderResult> {
  return requestData(() =>
    httpClient.put<ApiEnvelope<DisplayOrderResult>>(
      "/admin/promo/songs/display-order",
      { songRequestIds },
    ),
  );
}

export function useChangeDisplayOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: changeDisplayOrder,
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: promoAdminQueryKeys.songRequests(),
      });
    },
  });
}
