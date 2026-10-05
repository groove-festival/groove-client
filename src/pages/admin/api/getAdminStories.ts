import { useQuery } from "@tanstack/react-query";

import { type ApiEnvelope, httpClient, requestData } from "@/shared/api";

import { stageAdminQueryKeys } from "./queryKeys";

export interface AdminStory {
  storySubmissionId: number;
  college: string;
  department: string;
  studentNumber: string;
  name: string;
  nickname: string | null;

  song: string | null;
  title: string;
  content: string;
  submittedAt: string;
}

export async function getAdminStories(): Promise<AdminStory[]> {
  return requestData(() =>
    httpClient.get<ApiEnvelope<AdminStory[]>>("/admin/stage/stories"),
  );
}

export function useAdminStories() {
  return useQuery({
    queryKey: stageAdminQueryKeys.stories(),
    queryFn: getAdminStories,
  });
}
