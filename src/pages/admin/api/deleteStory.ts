import { useMutation, useQueryClient } from "@tanstack/react-query";

import { type ApiEnvelope, httpClient, requestVoid } from "@/shared/api";

import { stageAdminQueryKeys } from "./queryKeys";

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
