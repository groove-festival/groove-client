export const groovePlaylistQueryKeys = {
  all: () => ["groove-playlist"] as const,
  finalSongs: () => [...groovePlaylistQueryKeys.all(), "final-songs"] as const,
};
