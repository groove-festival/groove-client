import { useState } from "react";

import { LoadingFallback, NetworkErrorFallback } from "@/shared/ui";

import { useRivalScores } from "../api/getRivalScores";
import { useZones } from "../api/getZones";
import { type ZoneType } from "../model/zones";
import { EventBoothMap } from "./EventBoothMap";
import { RivalsSection } from "./RivalsSection";
import { ZoneCarousel } from "./ZoneCarousel";

// 라이벌스는 5초마다 다시 부르므로 한 번 실패했다고 지도까지 걷어내지 않는다.
// 섹션만 대체하고 다음 폴링에서 되살아나게 둔다.
const RivalsPanel = () => {
  const { data: scores, isPending, isError, refetch } = useRivalScores();

  if (isPending) return <LoadingFallback />;
  if (isError) return <NetworkErrorFallback onReload={() => void refetch()} />;

  return <RivalsSection scores={scores} />;
};

// 이벤트 화면 (Figma 34:3472). 체험존 카드와 지도 부스는 같은 선택 하나를
// 공유해, 어느 쪽에서 고르든 카드가 가운데로 오고 지도가 그 자리로 확대된다.
export default function EventPage() {
  const [selectedZone, setSelectedZone] = useState<ZoneType | null>(null);
  const { data: zones, isPending, isError, refetch } = useZones();

  return (
    <main className="flex flex-1 flex-col overflow-x-hidden bg-[#1c1c1c] text-[#fcfcfc]">
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

      <p className="mt-[208px] pb-10 text-center text-[10px] leading-3 text-[#a2a2a2]">
        자세한 소식과 문의는 GROOVE 축제 공식 SNS에서 확인해 주세요.
      </p>
    </main>
  );
}
