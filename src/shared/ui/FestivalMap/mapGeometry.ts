export interface MapSize {
  width: number;
  height: number;
}

export interface MapPosition {
  x: number;
  y: number;
}

export interface MapRatioPoint {
  xRatio: number;
  yRatio: number;
}

export const clampScale = (scale: number, minScale: number, maxScale: number) =>
  Math.min(Math.max(scale, minScale), maxScale);

export const getContainSize = (container: MapSize, source: MapSize): MapSize => {
  if (container.width <= 0 || container.height <= 0 || source.width <= 0) {
    return { width: 0, height: 0 };
  }

  const scale = Math.min(
    container.width / source.width,
    container.height / source.height,
  );

  return { width: source.width * scale, height: source.height * scale };
};

export const getFillScale = (container: MapSize, content: MapSize) => {
  if (content.width <= 0 || content.height <= 0) return 1;

  return Math.max(container.width / content.width, container.height / content.height);
};

export const getFocusPosition = (
  container: MapSize,
  content: MapSize,
  point: MapRatioPoint,
  scale: number,
): MapPosition => ({
  x: container.width / 2 - point.xRatio * content.width * scale,
  y: container.height / 2 - point.yRatio * content.height * scale,
});
