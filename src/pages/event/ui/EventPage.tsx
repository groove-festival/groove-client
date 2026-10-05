import { useState } from "react";

import { useZones } from "@/entities/zone";
import { LoadingFallback, NetworkErrorFallback } from "@/shared/ui";

import { useRivalScores } from "../api/getRivalScores";
import { type ZoneType } from "../model/zones";
import { EventBoothMap } from "./EventBoothMap";
import { RivalsSection } from "./RivalsSection";
import { ZoneCarousel } from "./ZoneCarousel";

const RivalsPanel = () => {
  const { data: scores, isPending, isError, refetch } = useRivalScores();

  if (isPending) return <LoadingFallback />;
  if (isError) return <NetworkErrorFallback onReload={() => void refetch()} />;

  return <RivalsSection scores={scores} />;
};

export default function EventPage() {
  const [selectedZone, setSelectedZone] = useState<ZoneType | null>(null);
  const { data: zones, isPending, isError, refetch } = useZones();

  return (
    <main className="flex flex-1 flex-col overflow-x-hidden bg-[#1c1c1c] pb-[100px] text-[#fcfcfc]">
      <div className="flex w-full flex-col gap-20 px-4 pt-[100px]">
        <section aria-labelledby="event-zone-heading" className="flex flex-col gap-4">
          <h2 className="text-2xl leading-[normal] font-bold" id="event-zone-heading">
            GRO-OVE ZONE
          </h2>

          {isPending && <LoadingFallback />}
          {isError && <NetworkErrorFallback onReload={() => void refetch()} />}
          {zones && (
            <>
              <ZoneCarousel
                onSelect={setSelectedZone}
                selectedZone={selectedZone}
                zones={zones}
              />
              <EventBoothMap
                onSelect={setSelectedZone}
                selectedZone={selectedZone}
                zones={zones}
              />
            </>
          )}
        </section>

        <section aria-label="GROOVE RIVALS">
          <RivalsPanel />
        </section>
      </div>
    </main>
  );
}
