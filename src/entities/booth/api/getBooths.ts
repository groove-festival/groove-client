import { useQuery } from "@tanstack/react-query";

import { type ApiEnvelope, httpClient, requestData } from "@/shared/api";

import type { Booth } from "../model/booths";
import { boothQueryKeys } from "./queryKeys";

export async function getBooths(): Promise<Booth[]> {
  return requestData(() => httpClient.get<ApiEnvelope<Booth[]>>("/pubs"));
}

export function useBooths() {
  return useQuery({
    queryKey: boothQueryKeys.list(),
    queryFn: getBooths,
  });
}
