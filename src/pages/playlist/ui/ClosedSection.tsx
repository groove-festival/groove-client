import { useNavigate } from "react-router";

import { lockIllustration } from "@/shared/ui";

import { PLAYLIST_BOTTOM_ANCHOR_ID } from "../model/playlistAnchors";

interface ClosedSectionProps {
  variant: "selection" | "published";
}

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
    </section>
  );
};
