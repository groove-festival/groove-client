import { useSearchParams } from "react-router";

import { parsePlaylistPhase } from "../model/playlistPhase";
import { ClosedSection } from "./ClosedSection";
import { CountdownSection } from "./CountdownSection";
import { FestivalHero } from "./FestivalHero";
import { SongRequestForm } from "./SongRequestForm";

export default function PlaylistPage() {
  const [searchParams] = useSearchParams();
  const phase = parsePlaylistPhase(searchParams.get("phase"));

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#1c1c1c] text-[#fcfcfc]">
      <div
        className={`relative mx-auto w-full max-w-[393px] overflow-hidden bg-[#1c1c1c] ${
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
