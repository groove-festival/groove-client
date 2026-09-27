export const contestStoryQueryKeys = {
  all: () => ["contest-stories"] as const,
  list: () => [...contestStoryQueryKeys.all(), "list"] as const,
};
