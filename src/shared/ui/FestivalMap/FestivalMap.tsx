import {
  type CSSProperties,
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
  getFillScale,
  getFocusPosition,
  type MapRatioPoint,
  type MapSize,
} from "./mapGeometry";
import { MapZoomControls } from "./MapZoomControls";

const FOCUS_ANIMATION_MS = 400;

const ZOOM_STEP = 1.6;
const BUTTON_ANIMATION_MS = 200;

export interface FestivalMapSource {
  src?: string;

  width: number;
  height: number;
  alt: string;
}

export interface FestivalMapFocus extends MapRatioPoint {
  scale?: number;
}

export interface FestivalMapFocusRequest extends FestivalMapFocus {
  requestId: number;
}

interface FestivalMapProps {
  source: FestivalMapSource;

  initialScale?: number;

  minScale?: number;
  maxScale?: number;

  initialCenter?: MapRatioPoint;

  focus?: FestivalMapFocus | null;

  focusRequest?: FestivalMapFocusRequest | null;

  resetTo?: FestivalMapFocus | null;

  className?: string;
  controlsClassName?: string;

  children?: ReactNode;
}

export const MAP_SCALE_VARIABLE = "--festival-map-scale";

const MAP_CENTER: MapRatioPoint = { xRatio: 0.5, yRatio: 0.5 };

export const FestivalMap = ({
  source,
  initialScale = 1,
  minScale = 1,
  maxScale = 8,
  initialCenter = MAP_CENTER,
  focus = null,
  focusRequest = null,
  resetTo = null,
  className = "",
  controlsClassName = "",
  children,
}: FestivalMapProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const transformRef = useRef<ReactZoomPanPinchContentRef>(null);
  const layerRef = useRef<HTMLDivElement>(null);
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

  const effectiveMinScale = Math.max(
    minScale,
    getFillScale({ width: containerWidth, height: containerHeight }, contentSize),
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
      const target = clampScale(scale, effectiveMinScale, maxScale);
      const { x, y } = getFocusPosition(container, contentSize, point, target);
      void transformRef.current?.setTransform(x, y, target, animationMs, "easeOut");
    },
    [containerWidth, containerHeight, contentSize, effectiveMinScale, maxScale],
  );

  const resetView = (animationMs: number) =>
    resetTo
      ? moveTo(resetTo, resetTo.scale ?? initialScale, animationMs)
      : moveTo({ xRatio: centerX, yRatio: centerY }, initialScale, animationMs);

  const moveToRef = useRef(moveTo);
  useEffect(() => {
    moveToRef.current = moveTo;
  });

  const isMeasured = contentSize.width > 0;
  useEffect(() => {
    if (!isMeasured) return;
    moveToRef.current({ xRatio: centerX, yRatio: centerY }, initialScale, 0);
  }, [isMeasured, centerX, centerY, initialScale]);

  const focusX = focus?.xRatio ?? null;
  const focusY = focus?.yRatio ?? null;
  const focusScale = focus?.scale ?? initialScale;

  useEffect(() => {
    if (!isMeasured || focusX === null || focusY === null) return;
    moveToRef.current(
      { xRatio: focusX, yRatio: focusY },
      focusScale,
      FOCUS_ANIMATION_MS,
    );
  }, [focusX, focusY, focusScale, isMeasured]);

  const requestedX = focusRequest?.xRatio ?? null;
  const requestedY = focusRequest?.yRatio ?? null;
  const requestedScale = focusRequest?.scale ?? initialScale;
  const focusRequestId = focusRequest?.requestId ?? null;

  useEffect(() => {
    if (
      !isMeasured ||
      focusRequestId === null ||
      requestedX === null ||
      requestedY === null
    ) {
      return;
    }

    moveToRef.current(
      { xRatio: requestedX, yRatio: requestedY },
      requestedScale,
      FOCUS_ANIMATION_MS,
    );
  }, [focusRequestId, isMeasured, requestedScale, requestedX, requestedY]);

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
        minScale={effectiveMinScale}
        onTransform={(_, state) => {
          viewRef.current = state;
          scaleRef.current = state.scale;

          layerRef.current?.style.setProperty(MAP_SCALE_VARIABLE, String(state.scale));
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
          {source.src && (
            <img
              alt={source.alt}
              className="pointer-events-none size-full select-none"
              draggable={false}
              src={source.src}
            />
          )}
          {children && (
            <div
              className="absolute inset-0"
              ref={layerRef}
              style={{ [MAP_SCALE_VARIABLE]: initialScale } as CSSProperties}
            >
              {children}
            </div>
          )}
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
