import { useMutation, useQueryClient } from "@tanstack/react-query";

import { festivalQueryKeys, type PlaylistPhase } from "@/entities/festival";
import { type ApiEnvelope, httpClient, requestData } from "@/shared/api";

export interface PhaseOverrideResult {
  // 지금 적용 중인 단계 (override 반영).
  phase: PlaylistPhase;
  // 설정된 override. null이면 일시 기준 자동 판정.
  phaseOverride: PlaylistPhase | null;
}

// PLST-A5. 단계 override를 설정하거나(phase) 해제한다(null → 자동 판정 복귀).
// 접수 기간 연장 요청은 재배포 없이 이 API로 대응한다.
export async function changePhaseOverride(
  phase: PlaylistPhase | null,
): Promise<PhaseOverrideResult> {
  return requestData(() =>
    httpClient.put<ApiEnvelope<PhaseOverrideResult>>("/admin/promo/playlist-phase", {
      phase,
    }),
  );
}

export function useChangePhaseOverride() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: changePhaseOverride,
    onSuccess: () => {
      // 참여자 화면이 쓰는 축제 상태도 바뀌었으니 무효화한다.
      void queryClient.invalidateQueries({ queryKey: festivalQueryKeys.all() });
    },
  });
}
