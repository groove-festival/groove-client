import { MapZoomControls } from "@/shared/ui";

import boothPin from "../festival-visuals/booth-pin.svg";
import eventMap from "../festival-visuals/event-map.png";
import {
  EVENT_MAP_SIZE,
  type ExperienceZone,
  type MapPoint,
  type ZoneType,
} from "../model/zones";

// 핀 SVG(67×81, 그림자 여백 포함)의 크기와 뾰족한 끝의 위치.
const PIN_SVG = { width: 67, height: 81, tipX: 33.5, tipY: 67 };
// Figma(39×53)보다 조금 작게 그린다.
const PIN_SCALE = 0.75;
// Figma 34:3573에서 핀 끝은 부스 중심보다 이만큼 위에 있다.
const PIN_TIP_ABOVE_BOOTH_CENTER = 10.2;

const toPercent = ({ x, y }: MapPoint) => ({
  left: `${(x / EVENT_MAP_SIZE.width) * 100}%`,
  top: `${(y / EVENT_MAP_SIZE.height) * 100}%`,
});

interface EventBoothMapProps {
  zones: readonly ExperienceZone[];
  selectedZone: ZoneType | null;
  onSelect: (zone: ZoneType) => void;
}

// 이벤트 부스 지도 (Figma 34:3604). 실제 지도 연동 전까지 정적 이미지 위에
// 부스 번호 자리마다 선택 버튼을 얹고, 선택된 부스 위에 핀(34:3609)을 띄운다.
export const EventBoothMap = ({
  zones,
  selectedZone,
  onSelect,
}: EventBoothMapProps) => {
  const selected = zones.find(({ type }) => type === selectedZone);

  return (
    <div className="relative aspect-[361/320] w-full overflow-hidden rounded-3xl bg-[#1c1c1c]">
      <img
        alt="체험존 1~5번 부스 위치가 표시된 이벤트 부스 지도"
        className="size-full object-cover"
        src={eventMap}
      />

      {selected && (
        // 위치는 바깥 span이 잡고, 안쪽 핀만 제자리에서 살짝 떠다닌다.
        <span
          className="pointer-events-none absolute"
          data-testid="booth-pin"
          data-zone={selected.type}
          key={selected.type}
          style={{
            ...toPercent({
              x: selected.boothCenter.x,
              y: selected.boothCenter.y - PIN_TIP_ABOVE_BOOTH_CENTER,
            }),
            width: PIN_SVG.width * PIN_SCALE,
            height: PIN_SVG.height * PIN_SCALE,
            transform: `translate(-${PIN_SVG.tipX * PIN_SCALE}px, -${PIN_SVG.tipY * PIN_SCALE}px)`,
          }}
        >
          <img
            alt=""
            className="animate-badge-float size-full max-w-none motion-reduce:animate-none"
            src={boothPin}
          />
        </span>
      )}

      {/* Figma에서 테두리는 지도와 핀 위에 그려진다. */}
      <div className="pointer-events-none absolute inset-0 rounded-3xl border border-[#767676]" />

      {zones.map((zone) => (
        <button
          aria-label={`${zone.name} 위치 선택`}
          aria-pressed={zone.type === selectedZone}
          className="absolute size-10 -translate-x-1/2 -translate-y-1/2 rounded-lg focus-visible:outline-2 focus-visible:outline-[#fcfcfc]"
          key={zone.type}
          onClick={() => onSelect(zone.type)}
          style={toPercent(zone.boothCenter)}
          type="button"
        />
      ))}

      <MapZoomControls
        className="absolute right-[5px] bottom-[7px] gap-4"
        zoomStepButtonSize={44}
      />
    </div>
  );
};
