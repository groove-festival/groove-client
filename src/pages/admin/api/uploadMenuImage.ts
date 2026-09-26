import { useMutation, useQueryClient } from "@tanstack/react-query";

import { type ApiEnvelope, httpClient, requestData } from "@/shared/api";

import { pubAdminQueryKeys } from "./queryKeys";
import { toImageFormData, type UploadImageResponseBody } from "./uploadMenuBoardImage";

export interface UploadMenuImageArgs {
  file: File;
  menuId: number;
}

// PUB-A12. 메뉴 카드에 들어가는 개별 음식 사진. 형식·용량 제한은 메뉴판
// 사진(PUB-A4)과 같다.
export async function uploadMenuImage({
  file,
  menuId,
}: UploadMenuImageArgs): Promise<string> {
  const response = await requestData<UploadImageResponseBody>(() =>
    httpClient.put<ApiEnvelope<UploadImageResponseBody>>(
      `/admin/pub/menus/${menuId}/image`,
      toImageFormData(file),
    ),
  );

  return response.imageUrl;
}

export function useUploadMenuImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: uploadMenuImage,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: pubAdminQueryKeys.me() });
    },
  });
}
