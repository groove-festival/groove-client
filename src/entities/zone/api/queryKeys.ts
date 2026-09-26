export const zoneQueryKeys = {
  all: () => ["zone"] as const,
  list: () => [...zoneQueryKeys.all(), "list"] as const,
};
