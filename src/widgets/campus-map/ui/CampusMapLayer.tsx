import { type SVGProps, useRef } from "react";

import { MapLabel, MapPin } from "@/shared/ui";

import campusBase from "../festival-visuals/campus-base.svg";
import pubsLayer from "../festival-visuals/campus-pubs.svg";
import zonesLayer from "../festival-visuals/campus-zones.svg";
import {
  CAMPUS_MAP_ALT,
  CAMPUS_MAP_SIZE,
  CAMPUS_MAP_VIEW_BOX,
  type CampusPlace,
  campusCoverShapes,
  type MapShape,
  type PlaceGroup,
} from "../model/places";

// 켤 때 배경 회색 도형 위에 얹는 색. 가요제 무대는 Figma 56:3802 실측,
// 랜드마크는 디자인 토큰 인디고다.
const overlayColors: Partial<Record<PlaceGroup, string>> = {
  stage: "#FF0080",
  landmark: "#5D00FF",
};
// 누르지 않아도 지명을 적어 두는 묶음. 길 찾기 기준이라 늘 보여야 한다.
const alwaysLabeledGroups: ReadonlySet<PlaceGroup> = new Set(["landmark"]);
// 꺼진 주막·체험존을 덮는 색. 배경 배치도의 같은 도형 색이다.
const COVER_COLOR = "#CFCFCF";
// 덮개 가장자리로 아래 색이 비치지 않도록 테두리를 조금 두른다 (배치도 px).
const COVER_STROKE_WIDTH = 0.3;
// 도형이 작아 그대로는 누르기 어렵다. 보이지 않는 테두리만큼 누르는 자리를 넓힌다
// (배치도 px, 한쪽에 절반씩).
const HIT_STROKE_WIDTH = 3;
// 지도를 끌다가 손을 뗀 것까지 "탭" 으로 보면 엉뚱한 장소가 선택된다.
// 누른 자리에서 이만큼 안 움직였을 때만 탭으로 친다.
const TAP_SLOP_PX = 6;

const fadeClassName =
  "transition-opacity duration-300 ease-out motion-reduce:transition-none";

const toPolygonPoints = (points: readonly (readonly [number, number])[]) =>
  points.map(([x, y]) => `${x},${y}`).join(" ");

const ShapePath = ({
  shape,
  ...props
}: { shape: MapShape } & Omit<SVGProps<SVGElement>, "ref">) => {
  if (shape.kind === "rect") {
    return (
      <rect
        height={shape.height}
        transform={`matrix(${shape.matrix.join(" ")})`}
        width={shape.width}
        {...props}
      />
    );
  }

  if (shape.kind === "polygon") {
    return <polygon points={toPolygonPoints(shape.points)} {...props} />;
  }

  return <path d={shape.d} {...props} />;
};

export interface CampusMapLayerProps {
  places: readonly CampusPlace[];
  // 색을 켜고 누를 수 있게 둘 장소. 꺼진 장소는 배경 회색으로 보이고 눌리지 않는다.
  isLit: (place: CampusPlace) => boolean;
  selectedId: string | null;
  // 장소가 아닌 빈 곳을 누르면 null 이 온다.
  onSelect: (place: CampusPlace | null) => void;
  // 눌렀을 때 무슨 일이 생기는지 보조기술에 알리는 이름. 기본은 "○○ 위치 보기".
  getActionLabel?: (place: CampusPlace) => string;
  // 늘 적어 두는 지명이 [사라지는 배율, 다 보이는 배율]. 박스 비율에 따라 값이 달라
  // CampusMap 이 계산해 넘긴다.
  labelVisibleScale?: readonly [hidden: number, shown: number];
}

const defaultActionLabel = (place: CampusPlace) => `${place.label} 위치 보기`;

// 배치도와 장소 레이어. 배치도·색 레이어 그림과 덮개·누르는 자리를 모두 한 SVG
// 안에 그린다. 그림을 HTML <img> 로 따로 두면 크게 확대했을 때 브라우저가 그림만
// 몇 px 어긋나게 그려 덮개 가장자리로 아래 색이 비친다.
// 주막·체험존은 색이 칠해진 레이어를 한 장씩 통째로 얹고, 꺼진 도형만 배경과 같은
// 회색으로 덮는다. 도형마다 그림을 잘라 겹치면 확대할수록 그림 수만큼 그리는 비용이
// 커지는데, 덮개는 작은 도형 몇 개뿐이라 가볍다.
export const CampusMapLayer = ({
  places,
  isLit,
  selectedId,
  onSelect,
  getActionLabel = defaultActionLabel,
  labelVisibleScale,
}: CampusMapLayerProps) => {
  const pressPoint = useRef<{ x: number; y: number } | null>(null);
  const litPlaces = places.filter(isLit);
  const litIds = new Set(litPlaces.map(({ id }) => id));
  const labeledPlaces = litPlaces.filter(({ group }) => alwaysLabeledGroups.has(group));
  // 지명이 적힌 장소는 골라도 핀을 한 번 더 띄우지 않는다.
  const selectedPlace = litPlaces.find(
    ({ id, group }) => id === selectedId && !alwaysLabeledGroups.has(group),
  );

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

  return (
    <div className="absolute inset-0">
      <svg
        aria-label="축제 장소 위치"
        className="absolute inset-0 size-full"
        fill="none"
        onPointerDown={rememberPress}
        role="group"
        viewBox={CAMPUS_MAP_VIEW_BOX}
        xmlns="http://www.w3.org/2000/svg"
      >
        <image
          aria-label={CAMPUS_MAP_ALT}
          className="pointer-events-none select-none"
          height={CAMPUS_MAP_SIZE.height}
          href={campusBase}
          role="img"
          width={CAMPUS_MAP_SIZE.width}
        />
        {[pubsLayer, zonesLayer].map((layer) => (
          <image
            aria-hidden="true"
            className="pointer-events-none select-none"
            height={CAMPUS_MAP_SIZE.height}
            href={layer}
            key={layer}
            width={CAMPUS_MAP_SIZE.width}
          />
        ))}

        {/* 디자인에 그려졌지만 켜지 않은 주막·체험존. 목록에 없는 부스도 여기서 꺼진다. */}
        {campusCoverShapes.map(({ id, shape }) => (
          <ShapePath
            className={`pointer-events-none ${fadeClassName}`}
            data-testid={`campus-map-cover-${id}`}
            fill={COVER_COLOR}
            key={id}
            shape={shape}
            stroke={COVER_COLOR}
            strokeWidth={COVER_STROKE_WIDTH}
            style={{ opacity: litIds.has(id) ? 0 : 1 }}
          />
        ))}

        {places.map((place) => {
          const color = overlayColors[place.group];
          if (!color) return null;

          return (
            <ShapePath
              className={`pointer-events-none ${fadeClassName}`}
              data-testid={`campus-map-color-${place.id}`}
              fill={color}
              key={place.id}
              shape={place.shape}
              style={{ opacity: litIds.has(place.id) ? 1 : 0 }}
            />
          );
        })}

        {/* 장소가 아닌 빈 곳을 탭하면 선택을 푼다. 장소 도형보다 먼저 그려
            장소 위에서는 이 영역이 잡히지 않는다. */}
        <rect
          data-testid="campus-map-background"
          fill="transparent"
          height="100%"
          onClick={(event) => {
            if (isTap(event)) onSelect(null);
          }}
          width="100%"
        />

        {litPlaces.map((place) => (
          <ShapePath
            aria-label={getActionLabel(place)}
            aria-pressed={place.id === selectedId}
            className="cursor-pointer outline-none focus-visible:stroke-[rgba(252,252,252,0.6)]"
            data-testid={`campus-map-place-${place.id}`}
            fill="transparent"
            key={place.id}
            onClick={(event) => {
              if (isTap(event)) onSelect(place);
            }}
            onKeyDown={(event) => {
              if (event.key !== "Enter" && event.key !== " ") return;
              event.preventDefault();
              onSelect(place);
            }}
            role="button"
            shape={place.shape}
            stroke="transparent"
            strokeWidth={HIT_STROKE_WIDTH}
            tabIndex={0}
          />
        ))}
      </svg>

      {labeledPlaces.map((place) => (
        <MapLabel
          key={place.id}
          label={place.label}
          point={place.point}
          visibleScale={labelVisibleScale}
        />
      ))}

      {/* 고른 장소의 핀은 지명보다 위에 그린다. */}
      {selectedPlace && (
        <MapPin label={selectedPlace.label} point={selectedPlace.point} />
      )}
    </div>
  );
};
