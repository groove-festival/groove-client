import { useMutation, useQueryClient } from "@tanstack/react-query";

import { type BoothStatus } from "@/entities/booth";
import { type ApiEnvelope, httpClient, requestData } from "@/shared/api";

import { pubAdminQueryKeys } from "./queryKeys";

interface ChangePubStatusResponseBody {
  status: BoothStatus;
}

// PUB-A2. 준비중으로 내리면 손님 주문 페이지(PUB-3/PUB-4)의 주문이 즉시 막힌다.
export async function changePubStatus(status: BoothStatus): Promise<BoothStatus> {
  const response = await requestData<ChangePubStatusResponseBody>(() =>
    httpClient.patch<ApiEnvelope<ChangePubStatusResponseBody>>("/admin/pub/status", {
      status,
    }),
  );

  return response.status;
}

export function useChangePubStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: changePubStatus,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: pubAdminQueryKeys.me() });
    },
  });
}
