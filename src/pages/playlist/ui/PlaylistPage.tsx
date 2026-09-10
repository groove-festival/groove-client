import { useSearchParams } from "react-router";

import { parsePlaylistPhaseOverride } from "../model/playlistPhase";
import { resolvePlaylistPhaseAt } from "../model/playlistSchedule";
import { useNow } from "../model/useNow";
import { ClosedSection } from "./ClosedSection";
import { CountdownSection } from "./CountdownSection";
import { FestivalHero } from "./FestivalHero";
import { SongRequestForm } from "./SongRequestForm";

export default function PlaylistPage() {
  const [searchParams] = useSearchParams();
  const now = useNow();
  const phase =
    parsePlaylistPhaseOverride(searchParams.get("phase")) ??
    resolvePlaylistPhaseAt(now);

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#1c1c1c] text-[#fcfcfc]">
      <div
        className={`relative w-full overflow-hidden bg-[#1c1c1c] ${
          phase === "before" ? "h-[3121px]" : "h-[3195px]"
        }`}
        id="top"
      >
        <FestivalHero />

        {phase === "before" && <CountdownSection />}
        {phase === "during" && <SongRequestForm />}
        {phase === "after" && <ClosedSection />}
      </div>
    </main>
  );
}
