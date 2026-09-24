import boothGroove from "../festival-visuals/booth-groove.svg";
import boothLove from "../festival-visuals/booth-love.svg";
import boothMove from "../festival-visuals/booth-move.svg";
import boothProve from "../festival-visuals/booth-prove.svg";
import boothRecover from "../festival-visuals/booth-recover.svg";
import { useRef } from "react";

import { isPlacedZone, type ExperienceZone, type ZoneType } from "../model/zones";

// 배경 배치도와 같은 프레임(976×1128)으로 내보낸 도형을 존별로 한 장씩 나눠 둔 것이다.
// 배경과 같은 방식(img)으로 같은 크기에 얹으므로 좌표를 다시 계산하지 않는다.
const boothImages: Record<ZoneType, string> = {
  MOVE: boothMove,
  LOVE: boothLove,
  PROVE: boothProve,
  RECOVER: boothRecover,
  GROOVE: boothGroove,
};

// 배경·부스 SVG 6장과 EventBoothMap 의 CROP 과 반드시 같은 값이어야 한다.
// 하나라도 다르면 누르는 자리가 도형에서 밀린다.
const MAP_VIEW_BOX = "540 610 100 88.643";
const BOOTH_SHAPE = { width: 8.13116, height: 5.5 } as const;
// 도형이 아주 작아 그대로는 누를 수 없다. 회전한 좌표계에서 넉넉하게 넓힌다.
const HIT_AREA = { width: 10, height: 11 } as const;
// 지도를 끌다가 손을 뗀 것까지 "빈 곳 탭" 으로 보면 선택이 제멋대로 풀린다.
// 누른 자리에서 이만큼 안 움직였을 때만 탭으로 친다.
const TAP_SLOP_PX = 6;

const hitRects: Record<ZoneType, { x: number; y: number; rotation: number }> = {
  MOVE: { x: 605.991, y: 659.146, rotation: -22.7032 },
  LOVE: { x: 596.992, y: 663.145, rotation: -22.7032 },
  PROVE: { x: 568.1, y: 665.398, rotation: -138.615 },
  RECOVER: { x: 587.992, y: 667.143, rotation: -22.7032 },
  GROOVE: { x: 572.835, y: 665.001, rotation: 72.2177 },
};

interface ZoneBoothLayerProps {
  zones: readonly ExperienceZone[];
  selectedZone: ZoneType | null;
  // 부스가 아닌 빈 곳을 누르면 null 이 온다.
  onSelect: (zone: ZoneType | null) => void;
}

// 배경 배치도 위에 겹치는 부스 레이어. 배경에는 같은 자리에 회색 부스가 이미
// 있으므로, 고르지 않은 부스는 색만 걷어내면 배경 회색이 그대로 드러난다.
export const ZoneBoothLayer = ({
  zones,
  selectedZone,
  onSelect,
}: ZoneBoothLayerProps) => {
  const placedZones = zones.filter(isPlacedZone);
  const pressPoint = useRef<{ x: number; y: number } | null>(null);

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
      {placedZones.map((zone) => (
        <img
          alt=""
          className="pointer-events-none absolute inset-0 size-full transition-opacity duration-300 ease-out select-none motion-reduce:transition-none"
          data-testid={`zone-booth-color-${zone.type}`}
          draggable={false}
          key={zone.type}
          src={boothImages[zone.type]}
          style={{
            // 아무것도 고르지 않았으면 5개 모두 제 색이다.
            opacity: selectedZone !== null && zone.type !== selectedZone ? 0 : 1,
          }}
        />
      ))}

      {/* 누르는 자리는 보이지 않는 별도 레이어로 얹는다. */}
      <svg
        aria-label="체험존 부스 위치"
        className="absolute inset-0 size-full"
        fill="none"
        role="group"
        onPointerDown={rememberPress}
        viewBox={MAP_VIEW_BOX}
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* 부스가 아닌 빈 곳을 탭하면 선택을 푼다. 부스 도형보다 먼저 그려
            부스 위에서는 이 영역이 잡히지 않는다. */}
        <rect
          data-testid="zone-map-background"
          fill="transparent"
          height="100%"
          onClick={(event) => {
            if (isTap(event)) onSelect(null);
          }}
          width="100%"
          x={MAP_VIEW_BOX.split(" ")[0]}
          y={MAP_VIEW_BOX.split(" ")[1]}
        />

        {placedZones.map((zone) => {
          const { x, y, rotation } = hitRects[zone.type];

          return (
            <rect
              aria-label={`${zone.name} 위치 선택`}
              aria-pressed={zone.type === selectedZone}
              className="cursor-pointer outline-none focus-visible:stroke-[#fcfcfc]"
              data-testid={`zone-booth-${zone.type}`}
              fill="transparent"
              height={HIT_AREA.height}
              key={zone.type}
              onClick={(event) => {
                if (!isTap(event)) return;
                onSelect(zone.type);
              }}
              onKeyDown={(event) => {
                if (event.key !== "Enter" && event.key !== " ") return;
                event.preventDefault();
                onSelect(zone.type);
              }}
              role="button"
              strokeWidth={0.6}
              tabIndex={0}
              transform={`rotate(${rotation} ${x} ${y})`}
              width={HIT_AREA.width}
              x={x + (BOOTH_SHAPE.width - HIT_AREA.width) / 2}
              y={y + (BOOTH_SHAPE.height - HIT_AREA.height) / 2}
            />
          );
        })}
      </svg>
    </div>
  );
};
