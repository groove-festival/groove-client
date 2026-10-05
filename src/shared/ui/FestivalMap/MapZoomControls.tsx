import { RotateCcw } from "lucide-react";

import zoomIn from "../festival-visuals/zoom-in.svg";
import zoomOut from "../festival-visuals/zoom-out.svg";

interface MapZoomControlsProps {
  className?: string;

  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onReset?: () => void;
}

const buttonSizeClass = "size-10";

export const MapZoomControls = ({
  className = "",
  onZoomIn,
  onZoomOut,
  onReset,
}: MapZoomControlsProps) => {
  const zoomControls = [
    {
      label: "지도 확대",
      icon: zoomIn,
      onClick: onZoomIn,
    },
    {
      label: "지도 축소",
      icon: zoomOut,
      onClick: onZoomOut,
    },
    {
      label: "지도 초기화",
      icon: null,
      onClick: onReset,
    },
  ];

  return (
    <div className={`flex flex-col ${className}`}>
      {zoomControls.map(({ label, icon, onClick }) => (
        <button
          aria-label={label}
          className={`festival-glass ${buttonSizeClass} rounded-full backdrop-blur-[40px] transition-transform duration-150 ease-out active:scale-95 motion-reduce:transition-none`}
          key={label}
          onClick={onClick}
          type="button"
        >
          {icon ? (
            <img alt="" className={buttonSizeClass} src={icon} />
          ) : (
            <RotateCcw
              aria-hidden="true"
              className="mx-auto size-[21px] rotate-90 text-[#cfcfcf]"
              strokeWidth={2.25}
            />
          )}
        </button>
      ))}
    </div>
  );
};
