import { PLAYLIST_BOTTOM_ANCHOR_ID } from "./FestivalHero";

interface PlaylistStatusErrorProps {
  onRetry: () => void;
}

// festival/status를 불러오지 못했을 때의 하단 섹션. 단계를 알 수 없으므로 임의로
// 추측하지 않고 재시도만 제공한다.
export const PlaylistStatusError = ({ onRetry }: PlaylistStatusErrorProps) => {
  return (
    <section
      className="absolute top-[2343px] left-0 h-[852px] w-full bg-[#1c1c1c]"
      id={PLAYLIST_BOTTOM_ANCHOR_ID}
    >
      <div className="font-pretendard absolute top-[300px] left-1/2 flex -translate-x-1/2 flex-col items-center gap-5 text-center">
        <p className="text-base leading-7 font-medium text-[#fcfcfc]">
          축제 정보를 불러오지 못했어요
        </p>
        <button
          className="h-12 w-[160px] rounded-2xl bg-[#5d00ff] text-sm font-semibold text-[#fcfcfc]"
          onClick={onRetry}
          type="button"
        >
          다시 시도
        </button>
      </div>

      <p className="absolute bottom-[40px] left-1/2 -translate-x-1/2 text-[10px] leading-3 whitespace-nowrap text-[#a2a2a2]">
        자세한 소식과 문의는 GROOVE 축제 공식 SNS에서 확인해 주세요.
      </p>
    </section>
  );
};
