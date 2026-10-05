import { useMutation, useQueryClient } from "@tanstack/react-query";

import { contestQueryKeys, type Vote } from "@/entities/contest";
import { type ApiEnvelope, httpClient, requestData } from "@/shared/api";

export type ToggleVoteStatusArgs =
  | { singingVoteId: number; status: "OPEN"; extendMinutes: number }
  | { singingVoteId: number; status: "CLOSED" };

export async function toggleVoteStatus(args: ToggleVoteStatusArgs): Promise<Vote> {
  const { singingVoteId, status } = args;
  const body =
    status === "OPEN" ? { status, extendMinutes: args.extendMinutes } : { status };

  return requestData(() =>
    httpClient.patch<ApiEnvelope<Vote>>(
      `/admin/stage/votes/${singingVoteId}/status`,
      body,
    ),
  );
}

export function useToggleVoteStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: toggleVoteStatus,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: contestQueryKeys.votes() });
    },
  });
}
