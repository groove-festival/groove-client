export const googleAuthQueryKeys = {
  all: () => ["google-auth"] as const,
  me: () => [...googleAuthQueryKeys.all(), "me"] as const,
};
