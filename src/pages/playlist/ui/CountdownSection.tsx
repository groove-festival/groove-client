import { PLAYLIST_BOTTOM_ANCHOR_ID } from "./FestivalHero";

// 신청 전(오픈 전 ~9/11) 하단 섹션. Figma 555:2391.
// 각 텍스트는 Figma 텍스트 박스 높이(66/105/30)에 맞춘 박스 안에서 중앙 정렬해
// 세로 위치를 원본과 맞춘다. 타이머는 정적 표기(00:00:00)이며 실제 카운트다운
// 로직은 후속 이슈로 분리한다.
export const CountdownSection = () => {
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

      <div className="absolute top-[375px] left-0 flex h-[105px] w-full items-center justify-center">
        <p
          aria-label="남은 시간 00시간 00분 00초"
          className="font-roboto text-[90px] leading-none font-bold whitespace-nowrap text-[#00ffff] tabular-nums"
        >
          00:00:00
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
