import { useMutation, useQueryClient } from "@tanstack/react-query";

import { type ApiEnvelope, httpClient, requestData } from "@/shared/api";

import { pubAdminQueryKeys } from "./queryKeys";
import { toImageFormData, type UploadImageResponseBody } from "./uploadMenuBoardImage";

export interface UploadMenuImageArgs {
  file: File;
  menuId: number;
}

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
