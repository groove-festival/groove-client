import { useMemo } from "react";

import { useCountdown } from "../model/useCountdown";
import { PLAYLIST_BOTTOM_ANCHOR_ID } from "../model/playlistAnchors";

interface CountdownSectionProps {
  targetIso?: string;
}

export const CountdownSection = ({ targetIso }: CountdownSectionProps) => {
  const target = useMemo(() => {
    if (!targetIso) {
      return null;
    }
    const parsed = new Date(targetIso);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }, [targetIso]);

  const { hours, minutes, seconds } = useCountdown(target);
  const hh = String(hours).padStart(2, "0");
  const mm = String(minutes).padStart(2, "0");
  const ss = String(seconds).padStart(2, "0");
  const timerSizeClass = hh.length > 2 ? "text-[72px]" : "text-[90px]";
  const timerText = target ? `${hh}:${mm}:${ss}` : "--:--:--";

  return (
    <section
      className="absolute top-[2269px] left-0 h-[852px] w-full bg-[#1c1c1c]"
      id={PLAYLIST_BOTTOM_ANCHOR_ID}
    >
      <div className="absolute top-[285px] left-0 flex h-[66px] w-full items-center justify-center">
        <p className="font-slow-gothic text-[40px] leading-none tracking-[1.6px] whitespace-nowrap text-[#00ffff]">
          COUNTDOWN
        </p>
      </div>

      <div className="absolute top-[375px] left-0 flex h-[105px] w-full items-center justify-center px-4">
        <p
          aria-label={
            target
              ? `신청 시작까지 ${hours}시간 ${minutes}분 ${seconds}초 남음`
              : "신청 시작 시각을 불러오는 중"
          }
          className={`font-roboto leading-none font-bold whitespace-nowrap text-[#00ffff] tabular-nums ${timerSizeClass}`}
        >
          {timerText}
        </p>
      </div>

      <div className="absolute top-[552px] left-0 flex h-[30px] w-full items-center justify-center">
        <p className="font-pretendard text-base font-medium whitespace-nowrap text-[#fcfcfc]">
          노래를 신청하고 GROOVE에 참여하세요!
        </p>
      </div>
    </section>
  );
};
