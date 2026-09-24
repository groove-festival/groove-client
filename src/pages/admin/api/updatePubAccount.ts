import { useMutation, useQueryClient } from "@tanstack/react-query";

import { type ApiEnvelope, httpClient, requestData } from "@/shared/api";

import { type AdminPubAccount, toAdminPubAccount } from "./getAdminPub";
import { pubAdminQueryKeys } from "./queryKeys";

export type UpdatePubAccountRequestBody = AdminPubAccount;

// PUB-A3. 주문 완료 모달(PUB-4 응답)에 노출되는 대표자 계좌를 등록·수정한다.
// 손님에게는 읽기 전용이고 수정 경로는 이것뿐이다.
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
