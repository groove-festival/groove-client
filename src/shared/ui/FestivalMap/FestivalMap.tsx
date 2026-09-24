import {
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  type ReactZoomPanPinchContentRef,
  TransformComponent,
  TransformWrapper,
} from "react-zoom-pan-pinch";

import {
  clampScale,
  getContainSize,
  getFocusPosition,
  type MapRatioPoint,
  type MapSize,
} from "./mapGeometry";
import { MapZoomControls } from "./MapZoomControls";

// 선택한 자리로 미끄러지는 시간. 카드 이동(520ms)보다 짧게 두어 지도가 먼저 멈춘다.
const FOCUS_ANIMATION_MS = 400;
// 확대·축소 버튼 한 번에 바뀌는 비율.
const ZOOM_STEP = 1.6;
const BUTTON_ANIMATION_MS = 200;

export interface FestivalMapSource {
  src: string;
  // 원본 지도의 좌표계 크기. 비율 좌표는 이 크기에 대한 0.0~1.0이다.
  width: number;
  height: number;
  alt: string;
}

export interface FestivalMapFocus extends MapRatioPoint {
  scale?: number;
}

interface FestivalMapProps {
  source: FestivalMapSource;
  // 배율 1은 지도 한 장이 컨테이너에 전부 들어오는 상태다.
  initialScale?: number;
  minScale?: number;
  maxScale?: number;
  // 처음 화면의 중심. 지도마다 보여줄 자리가 달라 쓰는 쪽이 정한다.
  initialCenter?: MapRatioPoint;
  // 값이 바뀔 때마다 그 자리로 확대·이동한다. null이면 그대로 둔다.
  focus?: FestivalMapFocus | null;
  // 바깥 박스(비율·테두리·배경)는 시안이 지도마다 달라 쓰는 쪽이 정한다.
  className?: string;
  controlsClassName?: string;
  // 지도와 함께 움직이는 레이어. 비율 좌표계(source 크기) 위에 그린다.
  children?: ReactNode;
}

const MAP_CENTER: MapRatioPoint = { xRatio: 0.5, yRatio: 0.5 };

// 배치도 이미지 한 장 위에 마커·부스 레이어를 얹고 확대·축소·이동을 담당하는 공용 지도.
// 얹는 내용과 바깥 박스 모양은 쓰는 화면이 넘긴다.
export const FestivalMap = ({
  source,
  initialScale = 1,
  minScale = 1,
  maxScale = 8,
  initialCenter = MAP_CENTER,
  focus = null,
  className = "",
  controlsClassName = "",
  children,
}: FestivalMapProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const transformRef = useRef<ReactZoomPanPinchContentRef>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);

  const { width: sourceWidth, height: sourceHeight } = source;
  const { xRatio: centerX, yRatio: centerY } = initialCenter;

  const contentSize = useMemo(
    () =>
      getContainSize(
        { width: containerWidth, height: containerHeight },
        { width: sourceWidth, height: sourceHeight },
      ),
    [containerWidth, containerHeight, sourceWidth, sourceHeight],
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const measure = () => {
      const { width, height } = container.getBoundingClientRect();
      setContainerWidth(width);
      setContainerHeight(height);
    };

    measure();

    const resizeObserver =
      typeof ResizeObserver === "undefined" ? null : new ResizeObserver(measure);
    resizeObserver?.observe(container);

    return () => resizeObserver?.disconnect();
  }, []);

  const moveTo = useCallback(
    (point: MapRatioPoint, scale: number, animationMs: number) => {
      if (contentSize.width <= 0) return;

      const container: MapSize = { width: containerWidth, height: containerHeight };
      const target = clampScale(scale, minScale, maxScale);
      const { x, y } = getFocusPosition(container, contentSize, point, target);
      void transformRef.current?.setTransform(x, y, target, animationMs, "easeOut");
    },
    [containerWidth, containerHeight, contentSize, maxScale, minScale],
  );

  const resetView = useCallback(
    (animationMs: number) =>
      moveTo({ xRatio: centerX, yRatio: centerY }, initialScale, animationMs),
    [centerX, centerY, initialScale, moveTo],
  );

  // 아래 두 효과는 moveTo를 의존성에 두지 않는다. 컨테이너 크기는 레이아웃이
  // 자리를 잡으며 소수점 단위로 흔들리는데, 그때마다 화면을 다시 잡으면
  // 사용자가 고른 자리나 직접 움직인 위치가 되돌아간다.
  const moveToRef = useRef(moveTo);
  useEffect(() => {
    moveToRef.current = moveTo;
  });

  // 처음 화면. 애니메이션 없이 곧장 놓아야 전체 지도가 잠깐 보였다가
  // 확대되는 깜빡임이 없다. 크기를 잰 뒤와 보여줄 자리가 정해진 뒤에만 다시 잡는다.
  const isMeasured = contentSize.width > 0;
  useEffect(() => {
    if (!isMeasured) return;
    moveToRef.current({ xRatio: centerX, yRatio: centerY }, initialScale, 0);
  }, [isMeasured, centerX, centerY, initialScale]);

  const focusX = focus?.xRatio ?? null;
  const focusY = focus?.yRatio ?? null;
  const focusScale = focus?.scale ?? initialScale;

  useEffect(() => {
    if (focusX === null || focusY === null) return;
    moveToRef.current(
      { xRatio: focusX, yRatio: focusY },
      focusScale,
      FOCUS_ANIMATION_MS,
    );
  }, [focusX, focusY, focusScale]);

  // 확대·축소 버튼은 보던 자리를 그대로 두고 배율만 바꾼다. 라이브러리의
  // zoomIn·zoomOut이 화면 한가운데를 기준으로 삼아 주므로 그대로 쓰되,
  // 폭이 절대값이라 지금 배율에 비례하도록 계산해 넘긴다.
  // 사용자가 직접 끌거나 핀치한 결과까지 반영하려면 현재 배율이 필요하다.
  const viewRef = useRef({ scale: initialScale, positionX: 0, positionY: 0 });
  const scaleRef = useRef(initialScale);

  const zoomIn = () =>
    void transformRef.current?.zoomIn(
      scaleRef.current * (ZOOM_STEP - 1),
      BUTTON_ANIMATION_MS,
      "easeOut",
    );

  const zoomOut = () =>
    void transformRef.current?.zoomOut(
      scaleRef.current * (1 - 1 / ZOOM_STEP),
      BUTTON_ANIMATION_MS,
      "easeOut",
    );

  return (
    <div className={`relative overflow-hidden ${className}`} ref={containerRef}>
      <TransformWrapper
        centerOnInit={false}
        doubleClick={{ disabled: true }}
        initialScale={initialScale}
        maxScale={maxScale}
        minScale={minScale}
        onTransform={(_, state) => {
          viewRef.current = state;
          scaleRef.current = state.scale;
        }}
        ref={transformRef}
      >
        <TransformComponent
          contentStyle={{
            position: "relative",
            width: contentSize.width || undefined,
            height: contentSize.height || undefined,
          }}
          wrapperStyle={{ width: "100%", height: "100%" }}
        >
          <img
            alt={source.alt}
            className="pointer-events-none size-full select-none"
            draggable={false}
            src={source.src}
          />
          {children && <div className="absolute inset-0">{children}</div>}
        </TransformComponent>
      </TransformWrapper>

      <MapZoomControls
        className={`absolute ${controlsClassName}`}
        onReset={() => resetView(BUTTON_ANIMATION_MS)}
        onZoomIn={zoomIn}
        onZoomOut={zoomOut}
      />
    </div>
  );
};
