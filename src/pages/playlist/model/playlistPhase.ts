import type { PlaylistPhase } from "@/entities/festival";

const overrideAliases: Record<string, PlaylistPhase> = {
  before_open: "BEFORE_OPEN",
  before: "BEFORE_OPEN",
  submission: "SUBMISSION",
  during: "SUBMISSION",
  selection: "SELECTION",
  after: "SELECTION",
  published: "PUBLISHED",
};

export function parsePlaylistPhaseOverride(value: string | null): PlaylistPhase | null {
  if (!value) {
    return null;
  }

  return overrideAliases[value.trim().toLowerCase()] ?? null;
}

export function nextPlaylistBoundaryAt(
  phase: PlaylistPhase | undefined,
  playlist: { submissionStartAt: string; submissionEndAt: string; publishAt: string },
): string | undefined {
  if (phase === "BEFORE_OPEN") {
    return playlist.submissionStartAt;
  }
  if (phase === "SUBMISSION") {
    return playlist.submissionEndAt;
  }
  if (phase === "SELECTION") {
    return playlist.publishAt;
  }
  return undefined;
}
