import { useMutation, useQueryClient } from "@tanstack/react-query";

import { festivalQueryKeys, type PlaylistPhase } from "@/entities/festival";
import { type ApiEnvelope, httpClient, requestData } from "@/shared/api";

export interface PhaseOverrideResult {
  phase: PlaylistPhase;

  phaseOverride: PlaylistPhase | null;
}

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
      void queryClient.invalidateQueries({ queryKey: festivalQueryKeys.all() });
    },
  });
}
