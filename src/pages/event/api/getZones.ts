import { useQuery } from "@tanstack/react-query";

import { type ApiEnvelope, httpClient, requestData } from "@/shared/api";

import type { ExperienceZone } from "../model/zones";
import { eventQueryKeys } from "./queryKeys";

interface ZoneListResponse {
  totalCount: number;
  zones: ExperienceZone[];
}

// PLAN-1. 배열은 화면 카드 순서대로 내려오므로 프론트에서 다시 정렬하지 않는다.
export async function getZones(): Promise<ExperienceZone[]> {
  const { zones } = await requestData(() =>
    httpClient.get<ApiEnvelope<ZoneListResponse>>("/zones"),
  );

  return zones;
}

export function useZones() {
  return useQuery({
    queryKey: eventQueryKeys.zones(),
    queryFn: getZones,
  });
}
