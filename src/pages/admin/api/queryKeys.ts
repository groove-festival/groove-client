export const promoAdminQueryKeys = {
  all: () => ["admin-promo"] as const,
  songRequests: () => [...promoAdminQueryKeys.all(), "song-requests"] as const,
};

export const stageAdminQueryKeys = {
  all: () => ["admin-stage"] as const,
  stories: () => [...stageAdminQueryKeys.all(), "stories"] as const,
  voteResults: (singingVoteId: number) =>
    [...stageAdminQueryKeys.all(), "vote-results", singingVoteId] as const,
};

export const pubAdminQueryKeys = {
  all: () => ["admin-pub"] as const,
  me: () => [...pubAdminQueryKeys.all(), "me"] as const,
  orders: () => [...pubAdminQueryKeys.all(), "orders"] as const,
  tables: () => [...pubAdminQueryKeys.all(), "tables"] as const,
};

export const planAdminQueryKeys = {
  all: () => ["admin-plan"] as const,
  rivalScores: () => [...planAdminQueryKeys.all(), "rival-scores"] as const,
};
