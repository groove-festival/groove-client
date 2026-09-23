export interface MapSize {
  width: number;
  height: number;
}

export interface MapPosition {
  x: number;
  y: number;
}

// 지도 이미지 기준 0.0~1.0 비율 좌표. API의 xRatio·yRatio와 같은 기준이다.
export interface MapRatioPoint {
  xRatio: number;
  yRatio: number;
}

export const clampScale = (scale: number, minScale: number, maxScale: number) =>
  Math.min(Math.max(scale, minScale), maxScale);

// 배율 1의 기준 크기. 지도 한 장이 컨테이너 안에 전부 들어오는 크기라
// 배율 1이면 전체 배치도가 보이고, 배율 n이면 딱 n배 확대된 상태가 된다.
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

// 비율 좌표가 컨테이너 한가운데 오도록 하는 콘텐츠 왼쪽 위 위치.
// react-zoom-pan-pinch의 setTransform이 받는 positionX·positionY다.
export const getFocusPosition = (
  container: MapSize,
  content: MapSize,
  point: MapRatioPoint,
  scale: number,
): MapPosition => ({
  x: container.width / 2 - point.xRatio * content.width * scale,
  y: container.height / 2 - point.yRatio * content.height * scale,
});
