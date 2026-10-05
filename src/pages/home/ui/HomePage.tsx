import { useFestivalStatus } from "@/entities/festival";
import { FestivalHero } from "@/widgets/festival-hero";

import { getStageShortcutBadges } from "../model/stageBadges";
import { FestivalMapSection } from "./FestivalMapSection";
import { RevealSection } from "./RevealSection";
import { ShortcutSection } from "./ShortcutSection";
import { TimetableSection } from "./TimetableSection";

const FESTIVAL_SHORTCUTS_SECTION_ID = "festival-shortcuts";

const scrollToFestivalShortcuts = () => {
  const prefersReducedMotion =
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  document.getElementById(FESTIVAL_SHORTCUTS_SECTION_ID)?.scrollIntoView({
    behavior: prefersReducedMotion ? "auto" : "smooth",
    block: "start",
  });
};

export default function HomePage() {
  const { data: festivalStatus } = useFestivalStatus();
  const shortcutBadges = getStageShortcutBadges(festivalStatus?.stage);

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#1c1c1c] pb-40 text-[#fcfcfc]">
      <FestivalHero
        bottomArrowText="축제 바로가기"
        id="top"
        onBottomArrowClick={scrollToFestivalShortcuts}
      />

      <div className="relative z-10 flex flex-col gap-20 px-4">
        <RevealSection id={FESTIVAL_SHORTCUTS_SECTION_ID} label="축제 바로가기">
          <ShortcutSection
            contestBadgeStatus={shortcutBadges.contest}
            storyBadgeStatus={shortcutBadges.story}
          />
        </RevealSection>
        <RevealSection delayMs={120} label="축제 전체 지도">
          <FestivalMapSection />
        </RevealSection>
        <RevealSection delayMs={240} label="타임테이블">
          <TimetableSection />
        </RevealSection>
      </div>
    </main>
  );
}
