import { IosSafariLocationGuide } from "@/shared/ui";

import type { LocationGateStatus } from "../model/useContestLocationGate";
import locationIcon from "../festival-visuals/location-icon.webp";

type NoticeStatus = Extract<
  LocationGateStatus,
  "out-of-range" | "permission-denied" | "unavailable"
>;

interface VoteLocationNoticeProps {
  onRetry: () => void;
  showSafariPermissionGuide: boolean;
  status: NoticeStatus;
}

const statusMessage: Record<NoticeStatus, string> = {
  "out-of-range": "무대 주변으로 이동하면 투표가 가능해요",
  "permission-denied": "위치 권한을 허용해주세요",
  unavailable: "위치를 확인할 수 없어요",
};

export function VoteLocationNotice({
  onRetry,
  showSafariPermissionGuide,
  status,
}: VoteLocationNoticeProps) {
  const shouldShowSafariGuide =
    status === "permission-denied" && showSafariPermissionGuide;

  return (
    <div className="flex w-[251px] flex-col items-center gap-6 text-center">
      <img alt="" className="h-[161px] w-[175px] object-contain" src={locationIcon} />
      <p className="text-base font-medium text-[#fcfcfc]">{statusMessage[status]}</p>

      {shouldShowSafariGuide && (
        <aside
          aria-label="Safari 위치 권한 설정 방법"
          className="w-full rounded-2xl border border-white/20 bg-[rgba(28,28,28,0.58)] px-4 py-3 backdrop-blur-xl"
        >
          <IosSafariLocationGuide />
        </aside>
      )}

      <button
        className="text-sm font-medium text-[#a2a2a2] underline"
        onClick={onRetry}
        type="button"
      >
        위치 다시 확인
      </button>
    </div>
  );
}
