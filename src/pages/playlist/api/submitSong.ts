import { useMutation } from "@tanstack/react-query";

import { type ApiEnvelope, httpClient, requestData } from "@/shared/api";

import {
  type ApiCollege,
  collegeToApiValue,
  type SongRequestFormValues,
} from "../model/songRequestForm";

export interface SubmitSongRequestBody {
  studentNumber: string;
  name: string;
  trackId: string;
  college: ApiCollege;
  department: string;
  nickname: string;
}

export interface SubmitSongResponseBody {
  songRequestId: number;
  trackId: string;
  title: string;
  artist: string;
  albumCoverUrl?: string;
  college: ApiCollege;
  department: string;
  nickname: string;
  requestedAt: string;
  updatedAt: string;
}

export function toSubmitSongBody(values: SongRequestFormValues): SubmitSongRequestBody {
  return {
    studentNumber: values.studentId,
    name: values.name,
    trackId: values.trackId,
    college: collegeToApiValue[values.college],
    department: values.department,
    nickname: values.nickname,
  };
}

export interface SubmitSongArgs {
  body: SubmitSongRequestBody;

  idempotencyKey: string;
}

export async function submitSong({
  body,
  idempotencyKey,
}: SubmitSongArgs): Promise<SubmitSongResponseBody> {
  return requestData(() =>
    httpClient.post<ApiEnvelope<SubmitSongResponseBody>>("/playlist/songs", body, {
      headers: { "Idempotency-Key": idempotencyKey },
    }),
  );
}

export function useSubmitSong() {
  return useMutation({ mutationFn: submitSong });
}
