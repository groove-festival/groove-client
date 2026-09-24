import { useQuery } from "@tanstack/react-query";

import { type ApiEnvelope, httpClient, requestData } from "@/shared/api";

import { songContestQueryKeys } from "./queryKeys";

export type ContestStoryCollege =
  "IT" | "NURSING" | "ART" | "SOCIAL" | "EDU" | "NATURE";

export interface PublicContestStory {
  storyId: number;
  title: string;
  nickname: string | null;
  college: ContestStoryCollege;
  submittedAt: string;
}

// SING-8. 참여자에게 공개되는 사연 목록. 본문·본명·학번·학과는 내려오지 않는다.
export async function getPublicContestStories(): Promise<PublicContestStory[]> {
  return requestData<PublicContestStory[]>(() =>
    httpClient.get<ApiEnvelope<PublicContestStory[]>>("/contest/stories"),
  );
}

export function usePublicContestStories(enabled = true) {
  return useQuery({
    enabled,
    queryKey: songContestQueryKeys.stories(),
    queryFn: getPublicContestStories,
  });
}
