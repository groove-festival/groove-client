import { Link } from "react-router";

import { cardChevronIcon } from "@/shared/ui";

import shortcutContest from "../festival-visuals/shortcut-contest.png";
import shortcutEvent from "../festival-visuals/shortcut-event.png";
import shortcutPlaylist from "../festival-visuals/shortcut-playlist.png";
import shortcutPub from "../festival-visuals/shortcut-pub.png";
import shortcutStory from "../festival-visuals/shortcut-story-sprite.png";
import {
  type ContestShortcutBadgeStatus,
  shortcutBadgeLabels,
  type ShortcutBadgeStatus,
  type StoryShortcutBadgeStatus,
} from "../model/stageBadges";

interface Shortcut {
  id: "pub" | "story" | "contest" | "event" | "playlist";
  title: string;
  description: string;
  to: string;
  icon: string;
}

const shortcuts: Shortcut[] = [
  {
    id: "pub",
    title: "주막",
    description: "단과대학 선택 후 QR로 셀프 주문",
    to: "/pub",
    icon: shortcutPub,
  },
  {
    id: "story",
    title: "사연 모집",
    description: "무대에서 소개될 사연 신청",
    to: "/story",
    icon: shortcutStory,
  },
  {
    id: "contest",
    title: "가요제",
    description: "타임테이블, 경연 목록 및 현장 투표",
    to: "/contest",
    icon: shortcutContest,
  },
  {
    id: "event",
    title: "이벤트",
    description: "체험존 안내 & 단대 순위(라이벌스)",
    to: "/event",
    icon: shortcutEvent,
  },
  {
    id: "playlist",
    title: "GROOVE PLAYLIST",
    description: "다함께 만드는 축제 PLAYLIST!",
    to: "/playlist",
    icon: shortcutPlaylist,
  },
];

// 전체메뉴(FestivalMenu)의 핑크 배지와 다른 메인 전용 배지 (Figma 25:2168).
const ShortcutStatusBadge = ({ status }: { status: ShortcutBadgeStatus }) => (
  <span className="animate-badge-float flex shrink-0 items-center justify-center rounded-full bg-[#5d00ff] px-2 py-1 text-[10px] leading-[normal] font-semibold whitespace-nowrap text-[#fcfcfc] drop-shadow-[0_0_2px_#5d00ff] motion-reduce:animate-none">
    {shortcutBadgeLabels[status]}
  </span>
);

const ShortcutIcon = ({ shortcut }: { shortcut: Shortcut }) => {
  if (shortcut.id === "story") {
    return (
      <span
        aria-hidden="true"
        className="flex h-14 w-16 shrink-0 items-center justify-center min-[393px]:h-[63px] min-[393px]:w-[73px]"
      >
        <span className="relative aspect-[1.1] h-full overflow-hidden">
          <img
            alt=""
            className="absolute top-[-10.65%] left-[-105.15%] h-[221.54%] w-[302.47%] max-w-none"
            src={shortcut.icon}
          />
        </span>
      </span>
    );
  }

  return (
    <img
      alt=""
      className="h-14 w-16 shrink-0 object-cover min-[393px]:h-[63px] min-[393px]:w-[73px]"
      src={shortcut.icon}
    />
  );
};

const ShortcutCard = ({
  shortcut,
  badgeStatus,
}: {
  shortcut: Shortcut;
  badgeStatus?: ShortcutBadgeStatus;
}) => (
  <Link
    className="flex min-h-[96px] w-full items-center gap-2 rounded-3xl border border-[#fcfcfc] bg-[#767676] py-4 pr-4 pl-3 text-[#fcfcfc] transition-transform duration-150 ease-out active:scale-[0.97] motion-reduce:transition-none min-[393px]:h-[96px] min-[393px]:py-6 min-[393px]:pr-6 min-[393px]:pl-4"
    to={shortcut.to}
  >
    <ShortcutIcon shortcut={shortcut} />
    <div className="flex min-w-0 flex-1 items-center justify-between gap-3">
      <div className="flex min-w-0 flex-col gap-1">
        <span className="flex flex-wrap items-center gap-1">
          <span className="text-lg leading-[normal] font-bold min-[393px]:text-xl">
            {shortcut.title}
          </span>
          {badgeStatus && <ShortcutStatusBadge status={badgeStatus} />}
        </span>
        <span className="w-full max-w-[220px] text-xs leading-[normal] text-[#cfcfcf] min-[393px]:w-[164px]">
          {shortcut.description}
        </span>
      </div>
      <img alt="" className="h-4 w-2 shrink-0" src={cardChevronIcon} />
    </div>
  </Link>
);

interface ShortcutSectionProps {
  contestBadgeStatus?: ContestShortcutBadgeStatus;
  storyBadgeStatus?: StoryShortcutBadgeStatus;
}

export const ShortcutSection = ({
  contestBadgeStatus,
  storyBadgeStatus,
}: ShortcutSectionProps) => (
  <ul className="flex w-full flex-col gap-4">
    {shortcuts.map((shortcut) => (
      <li key={shortcut.id}>
        <ShortcutCard
          badgeStatus={
            shortcut.id === "story"
              ? storyBadgeStatus
              : shortcut.id === "contest"
                ? contestBadgeStatus
                : undefined
          }
          shortcut={shortcut}
        />
      </li>
    ))}
  </ul>
);
