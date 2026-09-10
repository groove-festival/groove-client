import { SONG_REQUEST_OPENS_AT } from "../model/playlistSchedule";
import { useCountdown } from "../model/useCountdown";
import { PLAYLIST_BOTTOM_ANCHOR_ID } from "./FestivalHero";

// 신청 전(오픈 전) 하단 섹션. Figma 804:4335.
// 각 텍스트는 Figma 텍스트 박스 높이(66/105/30)에 맞춘 박스 안에서 중앙 정렬해
// 세로 위치를 원본과 맞춘다. 타이머는 신청 오픈 시각까지 1초 간격으로
// 카운트다운한다. 100시간을 넘어 시(hour)가 3자리 이상이 되면 좌우가 잘리지
// 않도록 글자 크기를 줄인다.
export const CountdownSection = () => {
  const { hours, minutes, seconds } = useCountdown(SONG_REQUEST_OPENS_AT);
  const hh = String(hours).padStart(2, "0");
  const mm = String(minutes).padStart(2, "0");
  const ss = String(seconds).padStart(2, "0");
  const timerSizeClass = hh.length > 2 ? "text-[72px]" : "text-[90px]";

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
          aria-label={`신청 시작까지 ${hours}시간 ${minutes}분 ${seconds}초 남음`}
          className={`font-roboto leading-none font-bold whitespace-nowrap text-[#00ffff] tabular-nums ${timerSizeClass}`}
        >
          {hh}:{mm}:{ss}
        </p>
      </div>

      <div className="absolute top-[552px] left-0 flex h-[30px] w-full items-center justify-center">
        <p className="font-pretendard text-base font-medium whitespace-nowrap text-[#fcfcfc]">
          노래를 신청하고 GROOVE에 참여하세요!
        </p>
      </div>

      <p className="absolute bottom-[37px] left-1/2 -translate-x-1/2 text-[10px] leading-3 whitespace-nowrap text-[#a2a2a2]">
        자세한 소식과 문의는 GROOVE 축제 공식 SNS에서 확인해 주세요.
      </p>
    </section>
  );
};
