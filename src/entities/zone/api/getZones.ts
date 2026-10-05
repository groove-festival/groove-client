import { useQuery } from "@tanstack/react-query";

import { type ApiEnvelope, httpClient, requestData } from "@/shared/api";

import type { ExperienceZone } from "../model/zone";
import { zoneQueryKeys } from "./queryKeys";

interface ZoneListResponse {
  totalCount: number;
  zones: ExperienceZone[];
}

export async function getZones(): Promise<ExperienceZone[]> {
  const { zones } = await requestData(() =>
    httpClient.get<ApiEnvelope<ZoneListResponse>>("/zones"),
  );

  return zones;
}

export function useZones() {
  return useQuery({
    queryKey: zoneQueryKeys.list(),
    queryFn: getZones,
  });
}
