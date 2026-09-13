import { LoadingFallback, NetworkErrorFallback } from "@/shared/ui";

import { isNotPublishedYet, useFinalPlaylist } from "../api/getFinalPlaylist";
import { PlaylistEntry } from "./PlaylistEntry";

// 축제 기간에 최종 선정 곡을 보여주는 전용 페이지. Figma 805:12036.
export default function GroovePlaylistPage() {
  const { data: playlist, isPending, isError, error } = useFinalPlaylist();
  const notPublishedYet = isError && isNotPublishedYet(error);

  if (isError && !notPublishedYet) {
    return <NetworkErrorFallback />;
  }

  if (isPending) {
    return <LoadingFallback />;
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#1c1c1c] text-[#fcfcfc]">
      <div
        className="font-pretendard relative h-[934px] w-full overflow-hidden bg-[#1c1c1c]"
        id="top"
      >
        <h1 className="absolute top-[100px] right-4 left-4 text-center text-xl font-bold whitespace-nowrap">
          GROOVE PLAYLIST
        </h1>

        <h2 className="absolute top-[148px] left-4 text-2xl font-bold">PLAYLIST</h2>

        <div className="absolute top-[201px] right-4 left-4 h-[602px]">
          <ul className="flex h-full flex-col gap-4 overflow-y-auto [mask-image:linear-gradient(to_bottom,transparent,#000_3px,#000_93%,transparent)]">
            {notPublishedYet && (
              <li className="text-sm text-[#a2a2a2]">
                아직 공개 전이에요. 축제 기간에 다시 확인해 주세요.
              </li>
            )}

            {playlist?.length === 0 && (
              <li className="text-sm text-[#a2a2a2]">아직 공개된 곡이 없어요.</li>
            )}

            {playlist?.map((entry, index) => (
              <PlaylistEntry
                entry={entry}
                key={`${entry.title}-${entry.nickname}-${index}`}
              />
            ))}
          </ul>
        </div>

        <p className="absolute bottom-[39px] left-1/2 -translate-x-1/2 text-[10px] leading-3 whitespace-nowrap text-[#a2a2a2]">
          자세한 소식과 문의는 GROOVE 축제 공식 SNS에서 확인해 주세요.
        </p>
      </div>
    </main>
  );
}
