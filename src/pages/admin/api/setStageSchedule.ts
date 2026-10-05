import { useMutation, useQueryClient } from "@tanstack/react-query";

import { festivalQueryKeys } from "@/entities/festival";
import { type ApiEnvelope, httpClient, requestData } from "@/shared/api";

export interface StageScheduleArgs {
  storyCollectionStartAt?: string;
  storyCollectionEndAt?: string;
  contestStartAt?: string;
  contestEndAt?: string;
}

export interface StageScheduleResponseBody {
  storyCollectionStartAt: string | null;
  storyCollectionEndAt: string | null;
  contestStartAt: string | null;
  contestEndAt: string | null;
}

export async function setStageSchedule(
  args: StageScheduleArgs,
): Promise<StageScheduleResponseBody> {
  return requestData(() =>
    httpClient.put<ApiEnvelope<StageScheduleResponseBody>>(
      "/admin/stage/schedule",
      args,
    ),
  );
}

export function useSetStageSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: setStageSchedule,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: festivalQueryKeys.all() });
    },
  });
}
