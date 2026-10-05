export const festivalQueryKeys = {
  all: () => ["festival"] as const,
  status: () => [...festivalQueryKeys.all(), "status"] as const,
};
