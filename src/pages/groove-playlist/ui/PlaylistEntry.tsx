import type { PlaylistEntry as PlaylistEntryData } from "../api/getGroovePlaylist";

interface PlaylistEntryProps {
  entry: PlaylistEntryData;
}

// 공개 플레이리스트의 한 곡. Figma 301:4281 컴포넌트.
export const PlaylistEntry = ({ entry }: PlaylistEntryProps) => {
  return (
    <li className="flex items-center gap-4">
      {/* 곡 썸네일 자리. 이미지 연동 시 <img>로 교체한다. */}
      <div className="aspect-square w-14 shrink-0 rounded-lg bg-[#fcfcfc]" />
      <div className="flex min-w-0 flex-1 items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-2">
          <p className="truncate text-base font-bold text-[#fcfcfc]">{entry.song}</p>
          <p className="truncate text-xs leading-4 font-medium text-[#fcfcfc]">
            {entry.artist}
          </p>
        </div>
        <p className="shrink-0 text-right text-xs whitespace-nowrap text-[#a2a2a2]">
          {entry.college} • {entry.nickname}
        </p>
      </div>
    </li>
  );
};
