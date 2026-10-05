export const playlistPhases = [
  "BEFORE_OPEN",
  "SUBMISSION",
  "SELECTION",
  "PUBLISHED",
] as const;

export type PlaylistPhase = (typeof playlistPhases)[number];
