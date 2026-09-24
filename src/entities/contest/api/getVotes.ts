import { useQuery } from "@tanstack/react-query";

import { type ApiEnvelope, httpClient, requestData } from "@/shared/api";

import type { Vote } from "../model/vote";
import { contestQueryKeys } from "./queryKeys";

// SING-2. 가요제 대진표 전체를 대진표 순서(라운드 → 경기 번호)로 받는다.
export async function getVotes(): Promise<Vote[]> {
  return requestData(() => httpClient.get<ApiEnvelope<Vote[]>>("/contest/votes"));
}

export function useVotes() {
  return useQuery({
    queryKey: contestQueryKeys.votes(),
    queryFn: getVotes,
  });
}
