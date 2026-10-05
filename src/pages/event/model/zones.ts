import { isPlacedZone, type ExperienceZone, type ZoneType } from "@/entities/zone";

export {
  isPlacedZone,
  type ExperienceZone,
  type PlacedZone,
  type ZoneType,
} from "@/entities/zone";

export const getZonesCenter = (zones: readonly ExperienceZone[]) => {
  const placed = zones.filter(isPlacedZone);
  if (placed.length === 0) return { xRatio: 0.5, yRatio: 0.5 };

  const xs = placed.map(({ xRatio }) => xRatio);
  const ys = placed.map(({ yRatio }) => yRatio);

  return {
    xRatio: (Math.min(...xs) + Math.max(...xs)) / 2,
    yRatio: (Math.min(...ys) + Math.max(...ys)) / 2,
  };
};

export const getZoneFocus = (
  zones: readonly ExperienceZone[],
  selectedZone: ZoneType | null,
) => {
  if (!selectedZone) return null;

  const zone = zones.find(({ type }) => type === selectedZone);
  if (!zone || !isPlacedZone(zone)) return null;

  return { xRatio: zone.xRatio, yRatio: zone.yRatio };
};
