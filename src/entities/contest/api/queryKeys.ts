export const contestQueryKeys = {
  all: () => ["contest"] as const,
  votes: () => [...contestQueryKeys.all(), "votes"] as const,
};
