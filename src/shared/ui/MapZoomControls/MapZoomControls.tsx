import zoomIn from "../festival-visuals/zoom-in.svg";
import zoomOut from "../festival-visuals/zoom-out.svg";
import zoomReset from "../festival-visuals/zoom-reset.svg";

type ZoomStepButtonSize = 40 | 44;

interface MapZoomControlsProps {
  // 위치와 버튼 간격은 지도마다 달라 호출하는 쪽에서 지정한다.
  className?: string;
  // 확대·축소 버튼 크기. 원래 크기 버튼은 두 시안 모두 40이다.
  zoomStepButtonSize?: ZoomStepButtonSize;
}

const buttonSizeClasses: Record<ZoomStepButtonSize, string> = {
  40: "size-10",
  44: "size-11",
};

// 확대 동작은 실제 지도 도입 때 연결한다. 지금은 Figma 배치만 맞춘다.
// 버튼 배경은 Figma GLASS(흐림 80)를 festival-glass와 강한 backdrop-blur로 근사한다.
export const MapZoomControls = ({
  className = "",
  zoomStepButtonSize = 40,
}: MapZoomControlsProps) => {
  const zoomControls = [
    {
      label: "지도 확대",
      icon: zoomIn,
      sizeClass: buttonSizeClasses[zoomStepButtonSize],
    },
    {
      label: "지도 축소",
      icon: zoomOut,
      sizeClass: buttonSizeClasses[zoomStepButtonSize],
    },
    {
      label: "지도 원래 크기로 보기",
      icon: zoomReset,
      sizeClass: buttonSizeClasses[40],
    },
  ];

  return (
    <div className={`flex flex-col ${className}`}>
      {zoomControls.map(({ label, icon, sizeClass }) => (
        <button
          aria-label={label}
          className={`festival-glass ${sizeClass} rounded-full backdrop-blur-[40px] transition-transform duration-150 ease-out active:scale-95 motion-reduce:transition-none`}
          key={label}
          type="button"
        >
          <img alt="" className={sizeClass} src={icon} />
        </button>
      ))}
    </div>
  );
};
