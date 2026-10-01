import { LocateFixed } from "lucide-react";

import type { CampusBoundaryStatus } from "../model/georeference";
import type { CampusLocationStatus } from "../model/useCampusLocation";

interface CampusLocationControlProps {
  status: CampusLocationStatus;
  boundaryStatus: CampusBoundaryStatus | null;
  onClick: () => void;
}

const getStatusMessage = (
  status: CampusLocationStatus,
  boundaryStatus: CampusBoundaryStatus | null,
) => {
  if (status === "permission-denied") return "위치 권한을 허용해주세요";
  if (status === "unavailable") return "위치를 확인할 수 없어요";
  if (boundaryStatus === "outside") return "캠퍼스 외부에 있어요";
  if (status === "locating") return "위치를 확인하고 있어요";
  return null;
};

export const CampusLocationControl = ({
  boundaryStatus,
  onClick,
  status,
}: CampusLocationControlProps) => {
  const message = getStatusMessage(status, boundaryStatus);

  return (
    <div className="absolute bottom-3 left-3 z-30 flex flex-col items-start gap-2">
      {message && (
        <span
          aria-live="polite"
          className="festival-glass max-w-[220px] rounded-full px-3 py-2 text-sm leading-5 font-semibold whitespace-pre-line text-[#f4f7fb] backdrop-blur-[40px]"
          role="status"
        >
          {message}
        </span>
      )}
      <button
        aria-label="내 위치 보기"
        className="festival-glass flex size-10 items-center justify-center rounded-full text-[#cfcfcf] backdrop-blur-[40px] transition-transform duration-150 ease-out active:scale-95 motion-reduce:transition-none"
        onClick={onClick}
        type="button"
      >
        <LocateFixed
          aria-hidden="true"
          className={`size-[21px] ${status === "locating" ? "animate-pulse" : ""}`}
          strokeWidth={2.25}
        />
      </button>
    </div>
  );
};
