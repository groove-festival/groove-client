import { FestivalHeader } from "@/widgets/festival-header";

import hourglass from "../festival-visuals/hourglass.png";

export default function ComingSoonPage() {
  return (
    <>
      <FestivalHeader />

      <main className="flex flex-1 flex-col overflow-x-hidden bg-[#1c1c1c] text-[#fcfcfc]">
        <section className="flex min-h-[calc(100dvh-64px)] w-full flex-col items-center bg-[#1c1c1c] px-5 pt-[18dvh] pb-9 text-center">
          <img
            alt=""
            className="aspect-[193/154] w-[min(49vw,193px)] min-w-[150px] object-contain"
            src={hourglass}
          />
          <p className="mt-12 text-xl font-bold">페이지 준비중입니다</p>
          <p className="mt-auto text-[10px] leading-3 text-[#a2a2a2]">
            자세한 소식과 문의는 GROOVE 축제 공식 SNS에서 확인해 주세요.
          </p>
        </section>
      </main>
    </>
  );
}
