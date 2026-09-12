import type { FinalPlaylistSong } from "../api/getFinalPlaylist";

const collegeLabels: Record<FinalPlaylistSong["college"], string> = {
  IT: "IT",
  NURSING: "간호",
  ART: "예술",
  SOCIAL: "사회",
  EDU: "사범",
  NATURE: "자연",
};

interface PlaylistEntryProps {
  entry: FinalPlaylistSong;
}

// 공개 플레이리스트의 한 곡. Figma 301:4281 컴포넌트.
export const PlaylistEntry = ({ entry }: PlaylistEntryProps) => {
  return (
    <li className="flex items-center gap-4">
      {entry.albumCoverUrl ? (
        <img
          alt=""
          className="aspect-square w-14 shrink-0 rounded-lg object-cover"
          src={entry.albumCoverUrl}
        />
      ) : (
        // 커버가 없으면 기본 이미지 자리로 폴백한다.
        <div className="aspect-square w-14 shrink-0 rounded-lg bg-[#fcfcfc]" />
      )}
      <div className="flex min-w-0 flex-1 items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-2">
          <p className="truncate text-base font-bold text-[#fcfcfc]">{entry.title}</p>
          <p className="truncate text-xs leading-4 font-medium text-[#fcfcfc]">
            {entry.artist}
          </p>
        </div>
        <p className="shrink-0 text-right text-xs whitespace-nowrap text-[#a2a2a2]">
          {collegeLabels[entry.college]} • {entry.nickname}
        </p>
      </div>
    </li>
  );
};
