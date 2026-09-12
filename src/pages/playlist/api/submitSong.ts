import { useMutation } from "@tanstack/react-query";

import { type ApiEnvelope, httpClient, requestData } from "@/shared/api";

import {
  type ApiCollege,
  collegeToApiValue,
  type SongRequestFormValues,
} from "../model/songRequestForm";

// PLST-3. 학번당 최종 1곡. 같은 학번이 다시 신청하면 서버가 기존 신청을 새 곡으로
// 덮어쓴다(200, 확인 절차 없음). 곡은 검색 결과의 trackId만 보낸다.
export interface SubmitSongRequestBody {
  studentNumber: string;
  name: string;
  trackId: string;
  college: ApiCollege;
  department: string;
  nickname: string;
}

// MySongResponse. 곡 메타(title/artist/albumCoverUrl)는 서버가 검색 시점에 축적한
// 곡 테이블에서 채워 내려준다.
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
  // 프론트가 만든 UUIDv4. 더블탭 재요청에 원래 성공 응답을 재현한다 (§1.6).
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
