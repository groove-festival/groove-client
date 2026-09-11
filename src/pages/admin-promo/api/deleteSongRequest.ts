import { useMutation, useQueryClient } from "@tanstack/react-query";

import { type ApiEnvelope, httpClient, requestVoid } from "@/shared/api";

import { adminPromoQueryKeys } from "./queryKeys";

// PLST-A2. 부적절한 신청 항목을 하드 딜리트한다. 삭제된 학번은 다시 신청할 수
// 있다 — 이름 오타·학번 선점으로 막힌 학생을 풀어주는 운영 수단이기도 하다.
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
        queryKey: adminPromoQueryKeys.songRequests(),
      });
    },
  });
}
