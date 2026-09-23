export const eventQueryKeys = {
  all: () => ["event"] as const,
  zones: () => [...eventQueryKeys.all(), "zones"] as const,
  rivalScores: () => [...eventQueryKeys.all(), "rival-scores"] as const,
};
