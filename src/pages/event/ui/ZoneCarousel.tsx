import zoneGroove from "../festival-visuals/zone-groove.webp";
import zoneLove from "../festival-visuals/zone-love.webp";
import zoneMove from "../festival-visuals/zone-move.webp";
import zoneProve from "../festival-visuals/zone-prove.webp";
import zoneRecover from "../festival-visuals/zone-recover.webp";
import { useZoneCarousel } from "../model/useZoneCarousel";
import { type ExperienceZone, type ZoneType } from "../model/zones";

interface ZoneCardStyle {
  background: string;

  highlight: string;
  icon: string;

  iconSlotClass: string;
  iconImageClass: string;
}

const zoneCardStyles: Record<ZoneType, ZoneCardStyle> = {
  MOVE: {
    background:
      "linear-gradient(181.52deg, rgb(209 38 38) 3.65%, rgb(227 58 148) 130.8%)",
    highlight: "액티비티 프로그램",
    icon: zoneMove,
    iconSlotClass: "h-[98px] w-[100px]",
    iconImageClass: "left-[-3.33px]",
  },
  LOVE: {
    background: "linear-gradient(to bottom, #e33a94 21.154%, #ff7296)",
    highlight: "편지 프로그램",
    icon: zoneLove,
    iconSlotClass: "h-[98px] w-[100px]",
    iconImageClass: "left-0",
  },
  PROVE: {
    background: "linear-gradient(to bottom, #ffa81c 21.154%, #f5ff35)",
    highlight: "GROOVE 아트월",
    icon: zoneProve,
    iconSlotClass: "h-[98px] w-[100px]",
    iconImageClass: "left-0",
  },
  RECOVER: {
    background: "linear-gradient(to bottom, #2bbf59 21.154%, #00ffb7)",
    highlight: "실팔찌",
    icon: zoneRecover,
    iconSlotClass: "h-[91px] w-[104px]",
    iconImageClass: "left-0",
  },
  GROOVE: {
    background: "linear-gradient(to bottom, #7e37dc 21.154%, #4f5eff)",
    highlight: "GRO-OVE를 마무리",
    icon: zoneGroove,
    iconSlotClass: "h-[89px] w-[92px]",
    iconImageClass: "left-0",
  },
};

const HighlightedDescription = ({
  description,
  highlight,
}: {
  description: string;
  highlight: string;
}) => {
  const highlightStart = description.indexOf(highlight);
  if (highlightStart < 0) return description;

  return (
    <>
      {description.slice(0, highlightStart)}
      <strong className="font-semibold">{highlight}</strong>
      {description.slice(highlightStart + highlight.length)}
    </>
  );
};

const ZoneCard = ({
  zone,
  isSelected,
  onSelect,
}: {
  zone: ExperienceZone;
  isSelected: boolean;
  onSelect: () => void;
}) => {
  const style = zoneCardStyles[zone.type];

  return (
    <button
      aria-pressed={isSelected}
      className="flex h-60 w-[204px] flex-col items-center justify-center rounded-[20px] p-[25px] text-center text-[#fcfcfc] transition-transform duration-150 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#fcfcfc] active:scale-[0.97] motion-reduce:transition-none"
      onClick={onSelect}
      style={{ backgroundImage: style.background }}
      type="button"
    >
      <span className="flex flex-col items-center gap-3">
        <span className="text-xl leading-[normal] font-bold whitespace-nowrap">
          {zone.name}
        </span>
        <span className="w-[168px] text-xs leading-[15px] break-keep">
          <HighlightedDescription
            description={zone.description}
            highlight={style.highlight}
          />
        </span>
        <span className={`relative shrink-0 ${style.iconSlotClass}`}>
          <img
            alt=""
            className={`absolute top-0 h-full w-auto max-w-none ${style.iconImageClass}`}
            src={style.icon}
          />
        </span>
      </span>
    </button>
  );
};

interface ZoneCarouselProps {
  zones: readonly ExperienceZone[];
  selectedZone: ZoneType | null;
  onSelect: (zone: ZoneType) => void;
}

export const ZoneCarousel = ({ zones, selectedZone, onSelect }: ZoneCarouselProps) => {
  const selectedIndex = zones.findIndex(({ type }) => type === selectedZone);
  const { scrollerRef, scrollMetrics } = useZoneCarousel(selectedIndex);
  const thumbWidthPercent = scrollMetrics.visibleRatio * 100;

  return (
    <div className="flex w-full flex-col gap-3">
      <ul
        aria-label="체험존 목록"

        className="relative flex w-full [scrollbar-width:none] gap-3 overflow-x-auto overscroll-x-contain [&::-webkit-scrollbar]:hidden"
        ref={scrollerRef}
      >
        {zones.map((zone) => (
          <li className="shrink-0" key={zone.type}>
            <ZoneCard
              isSelected={zone.type === selectedZone}
              onSelect={() => onSelect(zone.type)}
              zone={zone}
            />
          </li>
        ))}
      </ul>

      <div
        aria-hidden="true"
        className="relative h-1 w-full overflow-hidden rounded-full bg-[#fcfcfc]/15"
        data-testid="zone-slidebar"
      >
        <span
          className="absolute inset-y-0 rounded-full bg-[#fcfcfc]/70"
          data-testid="zone-slidebar-thumb"
          style={{
            width: `${thumbWidthPercent}%`,
            left: `${scrollMetrics.progress * (100 - thumbWidthPercent)}%`,
          }}
        />
      </div>
    </div>
  );
};
