export const eventQueryKeys = {
  all: () => ["event"] as const,
  rivalScores: () => [...eventQueryKeys.all(), "rival-scores"] as const,
};
