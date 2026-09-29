import { useMutation, useQueryClient } from "@tanstack/react-query";

import { boothQueryKeys } from "@/entities/booth";
import { type ApiEnvelope, httpClient, requestData } from "@/shared/api";

import { pubAdminQueryKeys } from "./queryKeys";

export interface PubProfile {
  description: string | null;
  name: string;
}

// PUB-A15. 손님 목록 카드·상세·지도 라벨이 모두 이 이름을 쓴다. 소개를 비우면 지운다.
export async function updatePubProfile(requestBody: PubProfile): Promise<PubProfile> {
  return requestData<PubProfile>(() =>
    httpClient.patch<ApiEnvelope<PubProfile>>("/admin/pub/profile", requestBody),
  );
}

export function useUpdatePubProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updatePubProfile,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: pubAdminQueryKeys.me() });
      // 같은 기기로 손님 화면을 열어 확인할 때 옛 이름이 남지 않게 한다.
      void queryClient.invalidateQueries({ queryKey: boothQueryKeys.all() });
    },
  });
}
