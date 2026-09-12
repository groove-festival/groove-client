import { useNavigate } from "react-router";

import lockIllustration from "../festival-visuals/lock.png";
import { PLAYLIST_BOTTOM_ANCHOR_ID } from "./FestivalHero";

interface ClosedSectionProps {
  // selection: 신청 마감 · 홍보팀 선정 중 · 최종 목록 비공개 (PLST 단계 SELECTION)
  // published: 최종 목록 공개됨 → GROOVE PLAYLIST 페이지로 유도 (PLST 단계 PUBLISHED)
  variant: "selection" | "published";
}

// 신청 폼·검색 UI 없이 안내만 노출하는 하단 섹션. Figma 555:2474.
// SELECTION 문구는 원본 그대로, PUBLISHED는 공개 사실과 이동 버튼으로 바꾼다.
export const ClosedSection = ({ variant }: ClosedSectionProps) => {
  const navigate = useNavigate();
  const isPublished = variant === "published";

  return (
    <section
      className="absolute top-[2343px] left-0 h-[852px] w-full bg-[#1c1c1c]"
      id={PLAYLIST_BOTTOM_ANCHOR_ID}
    >
      <p className="font-pretendard absolute top-[244px] left-1/2 -translate-x-1/2 text-center text-2xl leading-7 font-semibold whitespace-nowrap text-[#fcfcfc]">
        {isPublished ? "최종 플레이리스트가 공개됐어요" : "신청이 마감되었어요"}
      </p>

      <div className="absolute top-[296px] left-1/2 h-[259px] w-[280px] -translate-x-1/2">
        <img
          alt=""
          className="absolute inset-0 size-full max-w-none object-cover"
          src={lockIllustration}
        />
      </div>

      {isPublished ? (
        <button
          className="font-pretendard absolute top-[571px] left-1/2 h-14 w-[240px] -translate-x-1/2 rounded-2xl bg-[#5d00ff] text-base font-semibold text-[#fcfcfc]"
          onClick={() => navigate("/playlist")}
          type="button"
        >
          GROOVE PLAYLIST 보러가기
        </button>
      ) : (
        <p className="font-pretendard absolute top-[579px] left-1/2 -translate-x-1/2 text-center text-base leading-7 font-medium whitespace-nowrap text-[#fcfcfc]">
          최종 플레이리스트는 축제 기간에 공개됩니다
        </p>
      )}

      <p className="absolute bottom-[40px] left-1/2 -translate-x-1/2 text-[10px] leading-3 whitespace-nowrap text-[#a2a2a2]">
        자세한 소식과 문의는 GROOVE 축제 공식 SNS에서 확인해 주세요.
      </p>
    </section>
  );
};
