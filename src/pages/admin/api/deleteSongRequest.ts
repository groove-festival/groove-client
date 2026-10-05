import { useMutation, useQueryClient } from "@tanstack/react-query";

import { type ApiEnvelope, httpClient, requestVoid } from "@/shared/api";

import { promoAdminQueryKeys } from "./queryKeys";

export async function deleteSongRequest(songRequestId: number): Promise<void> {
  await requestVoid(() =>
    httpClient.delete<ApiEnvelope<unknown>>(`/admin/promo/songs/${songRequestId}`),
  );
}

export function useDeleteSongRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteSongRequest,
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: promoAdminQueryKeys.songRequests(),
      });
    },
  });
}
