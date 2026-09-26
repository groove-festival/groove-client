import { FestivalHero } from "@/widgets/festival-hero";

import { FestivalMapSection } from "./FestivalMapSection";
import { RevealSection } from "./RevealSection";
import { ShortcutSection } from "./ShortcutSection";
import { TimetableSection } from "./TimetableSection";

const FESTIVAL_MAP_SECTION_ID = "festival-map";

const scrollToFestivalMap = () => {
  const prefersReducedMotion =
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  document.getElementById(FESTIVAL_MAP_SECTION_ID)?.scrollIntoView({
    behavior: prefersReducedMotion ? "auto" : "smooth",
    block: "start",
  });
};

// 메인 화면 (Figma 25:902 / 25:1775). 히어로는 신청 페이지와 같은 위젯을 쓰고,
// 그 아래 지도·바로가기·타임테이블 섹션이 스크롤에 따라 차례로 올라온다.
export default function HomePage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-[#1c1c1c] pb-40 text-[#fcfcfc]">
      <FestivalHero id="top" onBottomArrowClick={scrollToFestivalMap} />

      <div className="relative z-10 flex flex-col gap-20 px-4">
        <RevealSection id={FESTIVAL_MAP_SECTION_ID} label="축제 전체 지도">
          <FestivalMapSection />
        </RevealSection>
        <RevealSection delayMs={120} label="바로가기">
          <ShortcutSection />
        </RevealSection>
        <RevealSection delayMs={240} label="타임테이블">
          <TimetableSection />
        </RevealSection>
      </div>
    </main>
  );
}
