import { lockIllustration } from "@/shared/ui";

export const PlaylistLockedScreen = () => {
  return (
    <main className="font-pretendard relative min-h-dvh w-full bg-[#1c1c1c] text-center text-[#fcfcfc]">
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-8 px-5">
        <h1 className="text-2xl font-semibold">아직 공개 전이에요</h1>

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
