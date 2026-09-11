import { useQuery } from "@tanstack/react-query";

import { type ApiEnvelope, httpClient, requestData } from "@/shared/api";

import { adminPromoQueryKeys } from "./queryKeys";

export type AdminCollege = "IT" | "NURSING" | "ART" | "SOCIAL" | "EDU" | "NATURE";

// 신청 항목 (홍보팀 관리자 전용 — 비공개 정보 포함). name·studentNumber·department는
// 화면에만 노출하고 분석·로그로 내보내지 않는다.
export interface AdminSongRequest {
  songRequestId: number;
  title: string;
  artist: string;
  albumCoverUrl?: string;
  trackId: string;
  nickname: string;
  name: string;
  studentNumber: string;
  college: AdminCollege;
  department: string;
  selected: boolean;
  // 공개 순서. 선정된 곡만 값을 가진다.
  displayOrder?: number;
  requestedAt: string;
  updatedAt: string;
}

export interface CollegeGroup {
  college: AdminCollege;
  collegeName: string;
  count: number;
  songs: AdminSongRequest[];
}

export interface AdminSongRequestList {
  totalCount: number;
  selectedCount: number;
  groups: CollegeGroup[];
}

// PLST-A1. 단대별로 그룹핑된 전체 신청 내역. 비공개 정보를 조회하는 유일한 경로.
export async function getSongRequests(): Promise<AdminSongRequestList> {
  return requestData(() =>
    httpClient.get<ApiEnvelope<AdminSongRequestList>>("/admin/promo/songs"),
  );
}

export function useSongRequests() {
  return useQuery({
    queryKey: adminPromoQueryKeys.songRequests(),
    queryFn: getSongRequests,
  });
}
