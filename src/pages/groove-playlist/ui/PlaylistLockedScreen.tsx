import { lockIllustration } from "@/shared/ui";

// 최종 플레이리스트가 아직 공개되지 않은 상태의 전용 화면. Figma 7:29.
// 상단바(FestivalHeader)는 공용 레이아웃에서 렌더되므로 본문만 구성한다.
// 제목·자물쇠·안내는 화면 정중앙에 묶어 배치한다.
export const PlaylistLockedScreen = () => {
  return (
    <main className="font-pretendard relative min-h-dvh w-full bg-[#1c1c1c] text-center text-[#fcfcfc]">
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-8 px-5">
        <h1 className="text-2xl font-semibold">아직 공개 전이에요</h1>

        {/* 자물쇠 PNG는 투명 여백이 있어 작게 보인다. object-cover로 여백만
            잘라내며 박스를 키워 Figma의 자물쇠 크기(약 237×208)에 맞춘다.
            (여백만 crop되므로 아치·X 배지 등 실제 그림은 잘리지 않는다.) */}
        <img
          alt=""
          className="h-[254px] w-[287px] object-cover"
          src={lockIllustration}
        />

        <p className="text-base font-medium">축제 기간에 다시 확인해주세요</p>
      </div>
    </main>
  );
};
