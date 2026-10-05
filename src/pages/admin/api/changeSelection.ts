import { useMutation, useQueryClient } from "@tanstack/react-query";

import { type ApiEnvelope, httpClient, requestData } from "@/shared/api";

import type { AdminSongRequest } from "./getSongRequests";
import { promoAdminQueryKeys } from "./queryKeys";

interface ChangeSelectionArgs {
  songRequestId: number;
  selected: boolean;
}

export async function changeSelection({
  songRequestId,
  selected,
}: ChangeSelectionArgs): Promise<AdminSongRequest> {
  return requestData(() =>
    httpClient.patch<ApiEnvelope<AdminSongRequest>>(
      `/admin/promo/songs/${songRequestId}/selection`,
      { selected },
    ),
  );
}

export function useChangeSelection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: changeSelection,
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: promoAdminQueryKeys.songRequests(),
      });
    },
  });
}
