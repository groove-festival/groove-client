import { useMutation, useQueryClient } from "@tanstack/react-query";

import { type ApiEnvelope, httpClient, requestData } from "@/shared/api";

import type { AdminSongRequest } from "./getSongRequests";
import { adminPromoQueryKeys } from "./queryKeys";

interface ChangeSelectionArgs {
  songRequestId: number;
  selected: boolean;
}

// PLST-A3. 최종 선정 여부 토글. 선정을 해제하면 서버가 그 곡의 공개 순서도
// 함께 비운다.
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
        queryKey: adminPromoQueryKeys.songRequests(),
      });
    },
  });
}
