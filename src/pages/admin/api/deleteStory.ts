import { useMutation, useQueryClient } from "@tanstack/react-query";

import { type ApiEnvelope, httpClient, requestVoid } from "@/shared/api";

import { stageAdminQueryKeys } from "./queryKeys";

// SING-A6. 부적절한 사연을 삭제한다. 복구 수단이 없어 프론트에서 확인
// 절차를 거친다.
export async function deleteStory(storyId: number): Promise<void> {
  await requestVoid(() =>
    httpClient.delete<ApiEnvelope<unknown>>(`/admin/stage/stories/${storyId}`),
  );
}

export function useDeleteStory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteStory,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: stageAdminQueryKeys.stories() });
    },
  });
}
