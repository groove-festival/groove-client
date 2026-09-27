import { useMutation } from "@tanstack/react-query";

import { type ApiEnvelope, httpClient, requestData } from "@/shared/api";

import {
  type ApiContestStoryCollege,
  type StoryFormValues,
  toApiContestStoryCollege,
} from "../model/storyForm";

export interface SubmitContestStoryRequestBody {
  college: ApiContestStoryCollege;
  department: string;
  studentNumber: string;
  name: string;
  nickname: string | null;
  title: string;
  content: string;
}

export interface SubmitContestStoryResponseBody {
  storyId: number;
  title: string;
  nickname: string | null;
  college: ApiContestStoryCollege;
  submittedAt: string;
  updatedAt: string;
}

export function toSubmitContestStoryBody(
  values: StoryFormValues,
): SubmitContestStoryRequestBody {
  const nickname = values.nickname.trim();

  return {
    college: toApiContestStoryCollege[values.college],
    department: values.department.trim(),
    studentNumber: values.studentNumber.trim(),
    name: values.name.trim(),
    nickname: nickname ? nickname : null,
    title: values.title.trim(),
    content: values.content.trim(),
  };
}

// SING-6. 계정당 1건이며 재제출은 서버가 기존 사연을 덮어쓴다.
export async function submitContestStory(
  body: SubmitContestStoryRequestBody,
): Promise<SubmitContestStoryResponseBody> {
  return requestData(() =>
    httpClient.post<ApiEnvelope<SubmitContestStoryResponseBody>>(
      "/contest/stories",
      body,
    ),
  );
}

export function useSubmitContestStory() {
  return useMutation({ mutationFn: submitContestStory });
}
