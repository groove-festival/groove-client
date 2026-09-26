import { type SVGProps, useRef } from "react";

import { MapPin } from "@/shared/ui";

import pubsLayer from "../festival-visuals/main-map-pubs.svg";
import zonesLayer from "../festival-visuals/main-map-zones.svg";
import {
  isGroupLit,
  MAIN_MAP_CROP,
  MAIN_MAP_VIEW_BOX,
  type MainMapPlace,
  type MapFilter,
  type MapShape,
  STAGE_SHAPE,
} from "../model/mainMap";

// 가요제 무대 색 (Figma 56:3802 실측).
const STAGE_COLOR = "#FF0080";
// 도형이 작아 그대로는 누르기 어렵다. 보이지 않는 테두리만큼 누르는 자리를 넓힌다
// (배치도 px, 한쪽에 절반씩).
const HIT_STROKE_WIDTH = 3;
// 지도를 끌다가 손을 뗀 것까지 "탭" 으로 보면 엉뚱한 장소가 선택된다.
// 누른 자리에서 이만큼 안 움직였을 때만 탭으로 친다.
const TAP_SLOP_PX = 6;

const layerClassName =
  "pointer-events-none absolute inset-0 size-full transition-opacity duration-300 ease-out select-none motion-reduce:transition-none";

const toPolygonPoints = (points: readonly (readonly [number, number])[]) =>
  points.map(([x, y]) => `${x},${y}`).join(" ");

const ShapePath = ({
  shape,
  ...props
}: { shape: MapShape } & Omit<SVGProps<SVGElement>, "ref">) =>
  shape.kind === "rect" ? (
    <rect
      height={shape.height}
      transform={`matrix(${shape.matrix.join(" ")})`}
      width={shape.width}
      {...props}
    />
  ) : (
    <polygon points={toPolygonPoints(shape.points)} {...props} />
  );

interface MainMapLayerProps {
  places: readonly MainMapPlace[];
  filter: MapFilter;
  selectedId: string | null;
  // 장소가 아닌 빈 곳을 누르면 null 이 온다.
  onSelect: (id: string | null) => void;
}

// 배경 배치도 위에 겹치는 장소 레이어. 배경에는 같은 자리에 회색 도형이 이미
// 있으므로, 필터에서 빠진 묶음은 색만 걷어내면 배경 회색이 그대로 드러난다.
// 주막·체험존은 묶음째 켜고 끄므로 도형마다 자르지 않고 한 장씩 겹친다.
export const MainMapLayer = ({
  places,
  filter,
  selectedId,
  onSelect,
}: MainMapLayerProps) => {
  const pressPoint = useRef<{ x: number; y: number } | null>(null);
  const selectedPlace = places.find(({ id }) => id === selectedId);

  const rememberPress = (event: { clientX: number; clientY: number }) => {
    pressPoint.current = { x: event.clientX, y: event.clientY };
  };

  const isTap = (event: { clientX: number; clientY: number }) => {
    const start = pressPoint.current;
    // 포인터를 거치지 않은 클릭(키보드·보조기술)은 그대로 탭으로 본다.
    if (!start) return true;
    return (
      Math.abs(event.clientX - start.x) <= TAP_SLOP_PX &&
      Math.abs(event.clientY - start.y) <= TAP_SLOP_PX
    );
  };

  const litOpacity = (lit: boolean) => ({ opacity: lit ? 1 : 0 });

  return (
    <div className="absolute inset-0">
      <img
        alt=""
        className={layerClassName}
        data-testid="main-map-pubs"
        draggable={false}
        src={pubsLayer}
        style={litOpacity(isGroupLit("pub", filter))}
      />
      <img
        alt=""
        className={layerClassName}
        data-testid="main-map-zones"
        draggable={false}
        src={zonesLayer}
        style={litOpacity(isGroupLit("zone", filter))}
      />

      <svg
        aria-label="축제 장소 위치"
        className="absolute inset-0 size-full"
        fill="none"
        onPointerDown={rememberPress}
        role="group"
        viewBox={MAIN_MAP_VIEW_BOX}
        xmlns="http://www.w3.org/2000/svg"
      >
        <ShapePath
          className="pointer-events-none transition-opacity duration-300 ease-out motion-reduce:transition-none"
          data-testid="main-map-stage"
          fill={STAGE_COLOR}
          shape={STAGE_SHAPE}
          style={litOpacity(isGroupLit("stage", filter))}
        />

        {/* 장소가 아닌 빈 곳을 탭하면 핀을 닫는다. 장소 도형보다 먼저 그려
            장소 위에서는 이 영역이 잡히지 않는다. */}
        <rect
          data-testid="main-map-background"
          fill="transparent"
          height="100%"
          onClick={(event) => {
            if (isTap(event)) onSelect(null);
          }}
          width="100%"
          x={MAIN_MAP_CROP.x}
          y={MAIN_MAP_CROP.y}
        />

        {places
          .filter(({ group }) => isGroupLit(group, filter))
          .map((place) => (
            <ShapePath
              aria-label={`${place.label} 위치 보기`}
              aria-pressed={place.id === selectedId}
              className="cursor-pointer outline-none focus-visible:stroke-[rgba(252,252,252,0.6)]"
              data-testid={`main-map-place-${place.id}`}
              fill="transparent"
              key={place.id}
              onClick={(event) => {
                if (isTap(event)) onSelect(place.id);
              }}
              onKeyDown={(event) => {
                if (event.key !== "Enter" && event.key !== " ") return;
                event.preventDefault();
                onSelect(place.id);
              }}
              role="button"
              shape={place.shape}
              stroke="transparent"
              strokeWidth={HIT_STROKE_WIDTH}
              tabIndex={0}
            />
          ))}
      </svg>

      {selectedPlace && (
        <MapPin label={selectedPlace.label} point={selectedPlace.point} />
      )}
    </div>
  );
};
