import { useMutation } from "@tanstack/react-query";
import { isAxiosError } from "axios";

import { httpClient } from "@/shared/api";

import type { SongRequestFormValues } from "../model/songRequestForm";

// 백엔드 미구현 상태. true인 동안에는 네트워크 호출 없이 목 응답을 돌려준다.
// 실제 API 연동 시: USE_MOCK을 false로 바꾸고 createMockResponse / mockRequestedStudentIds
// 관련 코드를 삭제한다. 요청/응답 타입, SongRequestConflictError, 훅 시그니처는
// 실제 API에서도 그대로 쓰이므로 호출부를 건드리지 않는다.
const USE_MOCK = true;
const MOCK_LATENCY_MS = 600;

// 같은 학번으로 이미 신청된 곡이 있을 때 발생한다. 실제 API에서는 HTTP 409를
// 이 오류로 변환하고, 목에서는 세션 내 중복 학번을 감지해 던진다.
export class SongRequestConflictError extends Error {
  constructor() {
    super("이미 신청한 곡이 있습니다.");
    this.name = "SongRequestConflictError";
  }
}

export interface CreateSongRequestRequestBody {
  song: string;
  college: string;
  studentId: string;
  department: string;
  name: string;
  nickname: string;
  // 기존 신청을 덮어쓸지 여부. 덮어쓰기 확인 팝업에서 확인을 누르면 true로 재요청한다.
  overwrite: boolean;
}

export interface CreateSongRequestResponseBody {
  id: string;
  song: string;
  artist: string | null;
  thumbnailUrl: string | null;
}

export function toCreateSongRequestBody(
  values: SongRequestFormValues,
  overwrite = false,
): CreateSongRequestRequestBody {
  return {
    song: values.song,
    college: values.college,
    studentId: values.studentId,
    department: values.department,
    name: values.name,
    nickname: values.nickname,
    overwrite,
  };
}

// 목 전용: 이 세션에서 신청된 학번. USE_MOCK 제거 시 함께 삭제한다.
const mockRequestedStudentIds = new Set<string>();

function createMockResponse(
  body: CreateSongRequestRequestBody,
): Promise<CreateSongRequestResponseBody> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (!body.overwrite && mockRequestedStudentIds.has(body.studentId)) {
        reject(new SongRequestConflictError());
        return;
      }

      mockRequestedStudentIds.add(body.studentId);
      resolve({
        id: `mock-${Date.now()}`,
        song: body.song,
        artist: null,
        thumbnailUrl: null,
      });
    }, MOCK_LATENCY_MS);
  });
}

export async function createSongRequest(
  body: CreateSongRequestRequestBody,
): Promise<CreateSongRequestResponseBody> {
  if (USE_MOCK) {
    return createMockResponse(body);
  }

  try {
    const { data } = await httpClient.post<CreateSongRequestResponseBody>(
      "/song-requests",
      body,
    );
    return data;
  } catch (error) {
    if (isAxiosError(error) && error.response?.status === 409) {
      throw new SongRequestConflictError();
    }
    throw error;
  }
}

export function useCreateSongRequest() {
  return useMutation({ mutationFn: createSongRequest });
}
