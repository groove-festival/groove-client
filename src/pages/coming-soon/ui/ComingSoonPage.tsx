import hourglass from "../festival-visuals/hourglass.png";

export default function ComingSoonPage() {
  return (
    <main className="flex flex-1 flex-col overflow-x-hidden bg-[#1c1c1c] text-[#fcfcfc]">
      <section className="flex min-h-dvh w-full flex-col items-center bg-[#1c1c1c] px-5 pt-20 pb-9 text-center">
        <div className="flex flex-1 flex-col items-center justify-center">
          <img
            alt=""
            className="aspect-[193/154] w-[min(49vw,193px)] min-w-[150px] object-contain"
            src={hourglass}
          />
          <p className="mt-12 text-xl font-bold">페이지 준비중입니다</p>
        </div>
        <p className="text-[10px] leading-3 text-[#a2a2a2]">
          자세한 소식과 문의는 GROOVE 축제 공식 SNS에서 확인해 주세요.
        </p>
      </section>
    </main>
  );
}
