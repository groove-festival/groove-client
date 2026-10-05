export type ZoneType = "MOVE" | "LOVE" | "PROVE" | "RECOVER" | "GROOVE";

export interface ExperienceZone {
  type: ZoneType;
  name: string;
  description: string;

  xRatio: number | null;
  yRatio: number | null;
}

export interface PlacedZone extends ExperienceZone {
  xRatio: number;
  yRatio: number;
}

export const isPlacedZone = (zone: ExperienceZone): zone is PlacedZone =>
  zone.xRatio !== null && zone.yRatio !== null;
