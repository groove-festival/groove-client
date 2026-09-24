import { useQuery } from "@tanstack/react-query";

import { type ApiEnvelope, httpClient, requestData } from "@/shared/api";

import { stageAdminQueryKeys } from "./queryKeys";

// SING-A5. 무대 낭독 전 검수용. 참여자용(SING-8)과 달리 본명·학번·학과·본문까지
// 포함하는 유일한 경로다.
export interface AdminStory {
  storySubmissionId: number;
  college: string;
  department: string;
  studentNumber: string;
  name: string;
  nickname: string | null;
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
