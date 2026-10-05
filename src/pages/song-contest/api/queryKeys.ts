import { contestQueryKeys } from "@/entities/contest";

export const songContestQueryKeys = {
  myBallots: () => [...contestQueryKeys.all(), "my-ballots"] as const,
};
