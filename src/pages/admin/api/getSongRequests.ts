import { useQuery } from "@tanstack/react-query";

import { type ApiEnvelope, httpClient, requestData } from "@/shared/api";

import { promoAdminQueryKeys } from "./queryKeys";

export type AdminCollege = "IT" | "NURSING" | "ART" | "SOCIAL" | "EDU" | "NATURE";

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

export async function getSongRequests(): Promise<AdminSongRequestList> {
  return requestData(() =>
    httpClient.get<ApiEnvelope<AdminSongRequestList>>("/admin/promo/songs"),
  );
}

export function useSongRequests() {
  return useQuery({
    queryKey: promoAdminQueryKeys.songRequests(),
    queryFn: getSongRequests,
  });
}
