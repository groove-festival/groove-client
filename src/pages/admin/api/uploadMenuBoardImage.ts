import { useMutation, useQueryClient } from "@tanstack/react-query";

import { type ApiEnvelope, httpClient, requestData } from "@/shared/api";

import { pubAdminQueryKeys } from "./queryKeys";

export interface UploadImageResponseBody {
  imageUrl: string;
}

// FormData를 그대로 넘기면 axios가 boundary를 포함한 Content-Type을 붙인다.
// 직접 multipart/form-data 헤더를 지정하면 boundary가 빠져 서버가 파싱하지
// 못하므로 헤더를 건드리지 않는다.
export const toImageFormData = (file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  return formData;
};

// PUB-A4. 주막 전체의 실물 메뉴판을 찍은 1장. 메뉴 카드에 들어가는 개별 음식
// 사진(PUB-A12)과 별개다.
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
