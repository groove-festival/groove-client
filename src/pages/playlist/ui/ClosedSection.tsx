import lockIllustration from "../festival-visuals/lock.png";
import { PLAYLIST_BOTTOM_ANCHOR_ID } from "./FestivalHero";

// 신청 후(선정 9/17–9/30) 하단 섹션. Figma 555:2474.
// 신청 폼·검색 UI 없이 마감 안내만 노출한다(PRD FR-3.4).
export const ClosedSection = () => {
  return (
    <section
      className="absolute top-[2343px] left-0 h-[852px] w-full bg-[#1c1c1c]"
      id={PLAYLIST_BOTTOM_ANCHOR_ID}
    >
      <p className="font-pretendard absolute top-[244px] left-1/2 -translate-x-1/2 text-center text-2xl leading-7 font-semibold whitespace-nowrap text-[#fcfcfc]">
        신청이 마감되었어요
      </p>

      <div className="absolute top-[296px] left-1/2 h-[259px] w-[280px] -translate-x-1/2">
        <img
          alt=""
          className="absolute inset-0 size-full max-w-none object-cover"
          src={lockIllustration}
        />
      </div>

      <p className="font-pretendard absolute top-[579px] left-1/2 -translate-x-1/2 text-center text-base leading-7 font-medium whitespace-nowrap text-[#fcfcfc]">
        최종 플레이리스트는 축제 기간에 공개됩니다
      </p>

      <p className="absolute bottom-[40px] left-1/2 -translate-x-1/2 text-[10px] leading-3 whitespace-nowrap text-[#a2a2a2]">
        자세한 소식과 문의는 GROOVE 축제 공식 SNS에서 확인해 주세요.
      </p>
    </section>
  );
};
