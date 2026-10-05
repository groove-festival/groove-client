import { useRef, useState } from "react";

import collegeArt from "../festival-visuals/college-art.png";
import collegeEdu from "../festival-visuals/college-edu.png";
import collegeIt from "../festival-visuals/college-it.png";
import collegeNature from "../festival-visuals/college-nature.png";
import collegeNursing from "../festival-visuals/college-nursing.png";
import collegeSocial from "../festival-visuals/college-social.png";
import { type College, type RivalScore, splitRivalStandings } from "../model/rivals";
import { getRisenColleges, useCountUpScores, useRankFlip } from "../model/rivalsMotion";

const collegeIcons: Record<College, { icon: string; background: string }> = {
  IT: { icon: collegeIt, background: "linear-gradient(to bottom, #fcfcfc, #cfcfcf)" },
  NURSING: {
    icon: collegeNursing,
    background: "linear-gradient(to bottom, #f3c3d3, #ff6b9d)",
  },
  ART: { icon: collegeArt, background: "linear-gradient(to bottom, #ebc3a9, #ff8a3d)" },
  SOCIAL: {
    icon: collegeSocial,
    background: "linear-gradient(to bottom, #afe7ec, #00c2d1)",
  },
  EDU: { icon: collegeEdu, background: "linear-gradient(to bottom, #f7ebcb, #ffcd49)" },
  NATURE: {
    icon: collegeNature,
    background: "linear-gradient(to bottom, #b1e8bf, #4fd171)",
  },
};

interface RiseState {
  id: number;
  colleges: ReadonlySet<College>;
}

const CollegeIcon = ({
  college,
  sizeClass,
  rise,
}: {
  college: College;
  sizeClass: string;
  rise: RiseState;
}) => {
  const { icon, background } = collegeIcons[college];
  const isRising = rise.colleges.has(college);

  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-full p-2 ${sizeClass} ${
        isRising ? "motion-safe:animate-rival-rise" : ""
      }`}
      data-rising={isRising || undefined}
      key={isRising ? `rise-${rise.id}` : "still"}
      style={{ backgroundImage: background }}
    >
      <img alt="" className="w-full" src={icon} />
    </span>
  );
};

interface PodiumSlotStyle {
  orderClass: string;
  widthClass: string;
  rankClass: string;
  detailGapClass: string;
  iconClass: string;
  textClass: string;
}

const podiumSlotStyles: PodiumSlotStyle[] = [
  {
    orderClass: "order-2",
    widthClass: "w-20",
    rankClass: "h-[33px] text-[28px] [text-shadow:0_0_6.3px_rgb(252_252_252/0.8)]",
    detailGapClass: "gap-[9px]",
    iconClass: "size-20",
    textClass: "text-base leading-[19px]",
  },
  {
    orderClass: "order-1",
    widthClass: "w-[72px]",
    rankClass: "h-[24.3px] text-2xl [text-shadow:0_0_8px_rgb(252_252_252/0.8)]",
    detailGapClass: "gap-2",
    iconClass: "size-[72px]",
    textClass: "text-sm leading-[17px]",
  },
  {
    orderClass: "order-3",
    widthClass: "w-[72px]",
    rankClass: "h-[24.3px] text-2xl [text-shadow:0_0_8px_rgb(252_252_252/0.8)]",
    detailGapClass: "gap-[7px]",
    iconClass: "size-[72px]",
    textClass: "text-sm leading-[17px]",
  },
];

interface RankItemProps {
  entry: RivalScore;
  shownScore: number;
  rise: RiseState;
}

const PodiumItem = ({
  entry,
  shownScore,
  rise,
  style,
}: RankItemProps & { style: PodiumSlotStyle }) => (
  <li
    className={`flex flex-col items-center gap-3 ${style.orderClass} ${style.widthClass}`}
    data-rank-item={entry.college}
  >
    <span
      className={`w-full text-center leading-[normal] font-semibold ${style.rankClass}`}
    >
      {entry.rank}
    </span>
    <span className={`flex w-full flex-col items-center ${style.detailGapClass}`}>
      <CollegeIcon college={entry.college} rise={rise} sizeClass={style.iconClass} />
      <span className={`font-bold whitespace-nowrap ${style.textClass}`}>
        {entry.collegeName}
      </span>
      <span className={`font-medium tabular-nums ${style.textClass}`}>
        {shownScore}점
      </span>
    </span>
  </li>
);

const StandingRow = ({ entry, shownScore, rise }: RankItemProps) => (
  <li className="flex w-full items-center gap-4" data-rank-item={entry.college}>
    <span className="w-3 shrink-0 text-right text-xl leading-[normal] font-medium">
      {entry.rank}
    </span>
    <span className="flex h-[72px] min-w-0 flex-1 items-center gap-4 rounded-full border border-[#fcfcfc] bg-[#767676] pr-[24.5px] pl-[20.5px]">
      <CollegeIcon college={entry.college} rise={rise} sizeClass="size-12" />
      <span className="flex min-w-0 flex-1 items-center justify-between gap-3 text-sm leading-[17px] whitespace-nowrap">
        <span className="truncate font-bold">{entry.collegeName}</span>
        <span className="font-medium tabular-nums">{shownScore}점</span>
      </span>
    </span>
  </li>
);

interface RivalsSectionProps {
  scores: readonly RivalScore[];
}

export const RivalsSection = ({ scores }: RivalsSectionProps) => {
  const { podium, others } = splitRivalStandings(scores);
  const standingsRef = useRef<HTMLDivElement>(null);

  const [previousScores, setPreviousScores] = useState(scores);
  const [rise, setRise] = useState<RiseState>({ id: 0, colleges: new Set() });
  if (scores !== previousScores) {
    setPreviousScores(scores);
    setRise({ id: rise.id + 1, colleges: getRisenColleges(previousScores, scores) });
  }

  const getShownScore = useCountUpScores(scores);
  useRankFlip(standingsRef, scores);

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex w-[216px] flex-col">
        <h2 className="text-2xl leading-[normal] font-bold">
          GROOVE RIVALS : Drop the BEAT
        </h2>
        <p className="text-[10px] leading-3 text-[#a2a2a2]">
          체험존 참여, 주막, 가요제 등을 종합한 단대별 점수예요.
        </p>
      </div>

      <div className="flex w-full flex-col gap-5 pr-px pl-[5px]" ref={standingsRef}>
        <ol
          aria-label="라이벌스 1~3위"
          className="flex items-end justify-center gap-4 min-[393px]:gap-10"
        >
          {podium.map((entry, index) => (
            <PodiumItem
              entry={entry}
              key={entry.college}
              rise={rise}
              shownScore={getShownScore(entry.college, entry.score)}
              style={podiumSlotStyles[index]}
            />
          ))}
        </ol>
        <ol aria-label="라이벌스 4위 이하" className="flex w-full flex-col gap-4">
          {others.map((entry) => (
            <StandingRow
              entry={entry}
              key={entry.college}
              rise={rise}
              shownScore={getShownScore(entry.college, entry.score)}
            />
          ))}
        </ol>
      </div>
    </div>
  );
};
