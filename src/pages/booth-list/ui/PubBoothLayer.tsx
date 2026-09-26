import { useRef } from "react";

import { getBoothDisplayName, type Booth } from "@/entities/booth";

import activeBooths from "../festival-visuals/pub-booths-active.svg";
import { pubShapes } from "../model/pubShapes";

// 지도를 끌다가 손을 뗀 것까지 "탭" 으로 보면 엉뚱한 주막이 선택된다.
// 누른 자리에서 이만큼 안 움직였을 때만 탭으로 친다.
const TAP_SLOP_PX = 6;

interface PubBoothLayerProps {
  booths: readonly Booth[];
  // 지금 색을 남길 주막들. 단일 주막을 고르면 그 한 곳만 들어온다.
  highlightedCodes: ReadonlySet<string>;
  // 현재 구역·단대 필터에 들어 있어 회색이어도 선택할 수 있는 주막들.
  selectableCodes: ReadonlySet<string>;
  // 선택할 수 있는 주막을 눌렀을 때 불린다.
  onSelect: (boothCode: string) => void;
}

// 배경 배치도 위에 겹치는 주막 레이어. 배경에는 같은 자리에 회색 주막이 이미
// 있으므로, 고르지 않은 주막은 색만 걷어내면 배경 회색이 그대로 드러난다.
//
// 라임색 도형 22개가 한 장에 들어 있어 주막별로 파일을 나누는 대신 같은 그림을
// 겹쳐 놓고 도형 하나씩만 남기도록 잘라 쓴다. 그림이 한 장이라 내려받기도 한 번이다.
// 잘라낸 영역은 누르는 자리도 함께 정한다 — 도형 바깥은 눌러도 반응하지 않는다.
export const PubBoothLayer = ({
  booths,
  highlightedCodes,
  onSelect,
  selectableCodes,
}: PubBoothLayerProps) => {
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
      {Object.entries(pubShapes).map(([boothCode, shape]) => {
        const booth = booths.find((item) => item.boothCode === boothCode);
        const isLit = highlightedCodes.has(boothCode);
        const isSelectable = selectableCodes.has(boothCode);

        return (
          <button
            aria-label={booth && `${getBoothDisplayName(booth)} 주막만 보기`}
            className={`absolute inset-0 size-full transition-opacity duration-300 ease-in-out outline-none motion-reduce:transition-none ${
              isSelectable ? "cursor-pointer" : "pointer-events-none"
            }`}
            data-testid={`pub-booth-${boothCode}`}
            disabled={!isSelectable}
            key={boothCode}
            onClick={(event) => {
              if (isTap(event)) onSelect(boothCode);
            }}
            onPointerDown={rememberPress}
            style={{
              clipPath: `polygon(${shape.clipPath})`,
              opacity: isLit ? 1 : 0,
            }}
            type="button"
          >
            <img
              alt=""
              className="pointer-events-none size-full select-none"
              draggable={false}
              src={activeBooths}
            />
          </button>
        );
      })}
    </div>
  );
};
