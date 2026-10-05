import { useMutation, useQueryClient } from "@tanstack/react-query";

import { boothQueryKeys } from "@/entities/booth";
import { type ApiEnvelope, httpClient, requestData } from "@/shared/api";

import { pubAdminQueryKeys } from "./queryKeys";

export interface PubProfile {
  description: string | null;
  name: string;
}

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

      void queryClient.invalidateQueries({ queryKey: boothQueryKeys.all() });
    },
  });
}
