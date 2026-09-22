import { useState } from "react";

import { MOCK_RIVAL_SCORES } from "../model/rivals";
import { EXPERIENCE_ZONES, type ZoneType } from "../model/zones";
import { EventBoothMap } from "./EventBoothMap";
import { RivalsSection } from "./RivalsSection";
import { ZoneCarousel } from "./ZoneCarousel";

// 이벤트 화면 (Figma 34:3472 / 선택 상태 34:3573). 체험존 카드와 지도 부스는
// 같은 선택 하나를 공유해, 어느 쪽에서 고르든 카드가 가운데로 오고 핀이 옮겨간다.
export default function EventPage() {
  const [selectedZone, setSelectedZone] = useState<ZoneType | null>(null);

  return (
    <main className="flex flex-1 flex-col overflow-x-hidden bg-[#1c1c1c] text-[#fcfcfc]">
      <div className="flex w-full flex-col gap-20 px-4 pt-[100px]">
        <section aria-labelledby="event-zone-heading" className="flex flex-col gap-4">
          <h2 className="text-2xl leading-[normal] font-bold" id="event-zone-heading">
            GRO-OVE ZONE
          </h2>
          <ZoneCarousel
            onSelect={setSelectedZone}
            selectedZone={selectedZone}
            zones={EXPERIENCE_ZONES}
          />
          <EventBoothMap
            onSelect={setSelectedZone}
            selectedZone={selectedZone}
            zones={EXPERIENCE_ZONES}
          />
        </section>

        <section aria-label="GROOVE RIVALS">
          <RivalsSection scores={MOCK_RIVAL_SCORES} />
        </section>
      </div>

      <p className="mt-[208px] pb-10 text-center text-[10px] leading-3 text-[#a2a2a2]">
        자세한 소식과 문의는 GROOVE 축제 공식 SNS에서 확인해 주세요.
      </p>
    </main>
  );
}
