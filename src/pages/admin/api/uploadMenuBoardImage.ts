import { useMutation, useQueryClient } from "@tanstack/react-query";

import { type ApiEnvelope, httpClient, requestData } from "@/shared/api";

import { pubAdminQueryKeys } from "./queryKeys";

export interface UploadImageResponseBody {
  imageUrl: string;
}

export const toImageFormData = (file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  return formData;
};

export async function uploadMenuBoardImage(file: File): Promise<string> {
  const response = await requestData<UploadImageResponseBody>(() =>
    httpClient.put<ApiEnvelope<UploadImageResponseBody>>(
      "/admin/pub/menu-board-image",
      toImageFormData(file),
    ),
  );

  return response.imageUrl;
}

export function useUploadMenuBoardImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: uploadMenuBoardImage,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: pubAdminQueryKeys.me() });
    },
  });
}
