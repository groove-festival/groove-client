import { useQuery } from "@tanstack/react-query";

import { type ApiEnvelope, httpClient, requestData } from "@/shared/api";

import type { Vote } from "../model/vote";
import { contestQueryKeys } from "./queryKeys";

export async function getVotes(): Promise<Vote[]> {
  return requestData(() => httpClient.get<ApiEnvelope<Vote[]>>("/contest/votes"));
}

export function useVotes() {
  return useQuery({
    queryKey: contestQueryKeys.votes(),
    queryFn: getVotes,
  });
}
