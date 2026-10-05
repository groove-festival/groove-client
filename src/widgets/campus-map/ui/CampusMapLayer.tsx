import { type SVGProps, useRef } from "react";

import { MapLabel, MapPin } from "@/shared/ui";

import campusBase from "../festival-visuals/campus-base.svg";
import pubNumbersLayer from "../festival-visuals/campus-pub-numbers.svg";
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
import type { CampusLocationProjection } from "../model/georeference";
import { CampusLocationLayer } from "./CampusLocationLayer";

const overlayColors: Partial<Record<PlaceGroup, string>> = {
  stage: "#FF0080",
  landmark: "#5D00FF",
};

const alwaysLabeledGroups: ReadonlySet<PlaceGroup> = new Set(["landmark"]);

const COVER_COLOR = "#CFCFCF";

const COVER_STROKE_WIDTH = 0.3;

const HIT_STROKE_WIDTH = 3;

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

  isVisible?: (place: CampusPlace) => boolean;

  isLit: (place: CampusPlace) => boolean;

  isSelectable?: (place: CampusPlace) => boolean;
  selectedId: string | null;

  onSelect: (place: CampusPlace | null) => void;

  getActionLabel?: (place: CampusPlace) => string;

  labelVisibleScale?: readonly [hidden: number, shown: number];

  keepDimmedPubNumbers?: boolean;

  location?: CampusLocationProjection | null;
}

const defaultActionLabel = (place: CampusPlace) => `${place.label} 위치 보기`;

export const CampusMapLayer = ({
  places,
  isVisible = () => true,
  isLit,
  isSelectable = isLit,
  selectedId,
  onSelect,
  getActionLabel = defaultActionLabel,
  labelVisibleScale,
  keepDimmedPubNumbers = false,
  location = null,
}: CampusMapLayerProps) => {
  const pressPoint = useRef<{ x: number; y: number } | null>(null);
  const visiblePlaces = places.filter(isVisible);
  const hiddenPlaces = places.filter((place) => !isVisible(place));
  const litPlaces = visiblePlaces.filter(isLit);
  const litIds = new Set(litPlaces.map(({ id }) => id));
  const selectablePlaces = visiblePlaces.filter(isSelectable);
  const labeledPlaces = litPlaces.filter(({ group }) => alwaysLabeledGroups.has(group));

  const selectedPlace = litPlaces.find(
    ({ id, group }) => id === selectedId && !alwaysLabeledGroups.has(group),
  );

  const pubNumbers = (
    <image
      aria-hidden="true"
      className="pointer-events-none select-none"
      height={CAMPUS_MAP_SIZE.height}
      href={pubNumbersLayer}
      width={CAMPUS_MAP_SIZE.width}
    />
  );

  const rememberPress = (event: { clientX: number; clientY: number }) => {
    pressPoint.current = { x: event.clientX, y: event.clientY };
  };

  const isTap = (event: { clientX: number; clientY: number }) => {
    const start = pressPoint.current;

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

        {!keepDimmedPubNumbers && pubNumbers}

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

        {keepDimmedPubNumbers && pubNumbers}

        {visiblePlaces.map((place) => {
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

        {hiddenPlaces.map((place) => (
          <ShapePath
            className="pointer-events-none"
            data-testid={`campus-map-hidden-${place.id}`}
            fill={COVER_COLOR}
            key={place.id}
            shape={place.shape}
            stroke={COVER_COLOR}
            strokeWidth={COVER_STROKE_WIDTH}
          />
        ))}

        <rect
          data-testid="campus-map-background"
          fill="transparent"
          height="100%"
          onClick={(event) => {
            if (isTap(event)) onSelect(null);
          }}
          width="100%"
        />

        {selectablePlaces.map((place) => (
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

      {selectedPlace && (
        <MapPin label={selectedPlace.label} point={selectedPlace.point} />
      )}

      {location && location.boundaryStatus !== "outside" && (
        <CampusLocationLayer location={location} />
      )}
    </div>
  );
};
