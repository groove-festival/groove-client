import { FestivalHeader } from "@/widgets/festival-header";

import hourglass from "../festival-visuals/hourglass.png";

export default function ComingSoonPage() {
  return (
    <>
      <FestivalHeader />

      <main className="flex flex-1 flex-col overflow-x-hidden bg-[#1c1c1c] text-[#fcfcfc]">
        <div className="figma-mobile-canvas relative h-[772px] bg-[#1c1c1c]">
          <img
            alt=""
            className="absolute top-[230px] left-[100px] h-[154px] w-[193px] object-contain"
            src={hourglass}
          />
          <p className="absolute top-[432px] left-0 w-full text-center text-xl font-bold">
            페이지 준비중입니다
          </p>
          <p className="absolute top-[720px] left-0 w-full text-center text-[10px] leading-3 text-[#a2a2a2]">
            자세한 소식과 문의는 GROOVE 축제 공식 SNS에서 확인해 주세요.
          </p>
        </div>
      </main>
    </>
  );
}
