export const boothQueryKeys = {
  all: () => ["booth"] as const,
  lists: () => [...boothQueryKeys.all(), "list"] as const,
  list: () => [...boothQueryKeys.lists(), "all"] as const,
  details: () => [...boothQueryKeys.all(), "detail"] as const,
  detail: (boothCode: string) => [...boothQueryKeys.details(), boothCode] as const,
};
