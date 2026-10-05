import { useMutation, useQueryClient } from "@tanstack/react-query";

import { type ApiEnvelope, httpClient, requestData } from "@/shared/api";

import { type AdminPubAccount, toAdminPubAccount } from "./getAdminPub";
import { pubAdminQueryKeys } from "./queryKeys";

export type UpdatePubAccountRequestBody = AdminPubAccount;

export async function updatePubAccount(
  requestBody: UpdatePubAccountRequestBody,
): Promise<AdminPubAccount | null> {
  const response = await requestData<UpdatePubAccountRequestBody>(() =>
    httpClient.put<ApiEnvelope<UpdatePubAccountRequestBody>>(
      "/admin/pub/account",
      requestBody,
    ),
  );

  return toAdminPubAccount(response);
}

export function useUpdatePubAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updatePubAccount,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: pubAdminQueryKeys.me() });
    },
  });
}
