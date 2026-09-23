import { useMutation, useQueryClient } from "@tanstack/react-query";

import { festivalQueryKeys } from "@/entities/festival";
import { type ApiEnvelope, httpClient, requestData } from "@/shared/api";

// SING-A4. 사연모집·가요제 시작/종료 4개 시각을 한 번에 저장한다. 네 값 모두
// 선택이며, 비어 있는 쪽의 단계는 fail-closed로 BEFORE에 머문다.
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
      // 참여자 화면이 쓰는 축제 상태(stage.storyPhase·contestPhase)도 바뀌었으니
      // 무효화한다.
      void queryClient.invalidateQueries({ queryKey: festivalQueryKeys.all() });
    },
  });
}
