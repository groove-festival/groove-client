import { Link } from "react-router";

import { cardChevronIcon } from "@/shared/ui";

import shortcutContest from "../festival-visuals/shortcut-contest.png";
import shortcutEvent from "../festival-visuals/shortcut-event.png";
import shortcutPlaylist from "../festival-visuals/shortcut-playlist.png";
import shortcutPub from "../festival-visuals/shortcut-pub.png";
import {
  CONTEST_BADGE_STATUS,
  contestBadgeLabels,
  type ContestBadgeStatus,
} from "../model/contestBadge";

interface Shortcut {
  id: "pub" | "contest" | "event" | "playlist";
  title: string;
  description: string;
  to: string;
  icon: string;
}

// 가요제의 실제 목적지는 후속 이슈에서 연결한다.
const shortcuts: Shortcut[] = [
  {
    id: "pub",
    title: "주막 바로가기",
    description: "단과대학 선택 후 QR로 셀프 주문",
    to: "/pub",
    icon: shortcutPub,
  },
  {
    id: "contest",
    title: "가요제 바로가기",
    description: "타임테이블, 투표 확인, 예선 투표 및 사연 신청",
    to: "/coming-soon",
    icon: shortcutContest,
  },
  {
    id: "event",
    title: "이벤트 바로가기",
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
const ContestStatusBadge = ({ status }: { status: ContestBadgeStatus }) => (
  <span className="animate-badge-float flex shrink-0 items-center justify-center rounded-full bg-[#5d00ff] px-2 py-1 text-[8px] leading-[normal] font-semibold whitespace-nowrap text-[#fcfcfc] drop-shadow-[0_0_2px_#5d00ff] motion-reduce:animate-none">
    {contestBadgeLabels[status]}
  </span>
);

const ShortcutCard = ({
  shortcut,
  badgeStatus,
}: {
  shortcut: Shortcut;
  badgeStatus?: ContestBadgeStatus;
}) => (
  <Link
    className="flex h-[105px] w-full items-center gap-5 rounded-3xl border border-[#fcfcfc] bg-[#767676] py-5 pr-[21px] pl-5 text-[#fcfcfc] transition-transform duration-150 ease-out active:scale-[0.97] motion-reduce:transition-none"
    to={shortcut.to}
  >
    <img
      alt=""
      className="h-[63px] w-[73px] shrink-0 object-cover"
      src={shortcut.icon}
    />
    <div className="flex min-w-0 flex-1 items-center justify-between gap-3">
      <div className="flex min-w-0 flex-col gap-1.5">
        <span className="flex items-center gap-2">
          <span className="text-xl leading-[normal] font-bold whitespace-nowrap">
            {shortcut.title}
          </span>
          {badgeStatus && <ContestStatusBadge status={badgeStatus} />}
        </span>
        <span className="w-[164px] max-w-full text-xs leading-[normal] text-[#cfcfcf]">
          {shortcut.description}
        </span>
      </div>
      <img alt="" className="h-4 w-2 shrink-0" src={cardChevronIcon} />
    </div>
  </Link>
);

interface ShortcutSectionProps {
  contestBadgeStatus?: ContestBadgeStatus;
}

export const ShortcutSection = ({
  contestBadgeStatus = CONTEST_BADGE_STATUS,
}: ShortcutSectionProps) => (
  <ul className="flex w-full flex-col gap-4">
    {shortcuts.map((shortcut) => (
      <li key={shortcut.id}>
        <ShortcutCard
          badgeStatus={shortcut.id === "contest" ? contestBadgeStatus : undefined}
          shortcut={shortcut}
        />
      </li>
    ))}
  </ul>
);
