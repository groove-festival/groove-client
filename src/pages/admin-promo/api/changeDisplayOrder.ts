import { useMutation, useQueryClient } from "@tanstack/react-query";

import { type ApiEnvelope, httpClient, requestData } from "@/shared/api";

import type { AdminSongRequest } from "./getSongRequests";
import { adminPromoQueryKeys } from "./queryKeys";

export interface DisplayOrderResult {
  totalCount: number;
  // 공개 순서대로 정렬된 선정 곡.
  songs: AdminSongRequest[];
}

// PLST-A4. 공개(재생) 순서를 정렬된 식별자 배열로 일괄 지정한다. 부분 수정으로
// 순서가 꼬이지 않도록 최종 선정된 곡 전체를 순서대로 보낸다 — 하나라도 빠지거나,
// 선정되지 않은 곡이 섞이거나, 중복이면 400(PLST008)이다.
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
        queryKey: adminPromoQueryKeys.songRequests(),
      });
    },
  });
}
