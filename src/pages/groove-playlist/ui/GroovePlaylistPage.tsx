import { LoadingFallback, NetworkErrorFallback } from "@/shared/ui";

import { isNotPublishedYet, useFinalPlaylist } from "../api/getFinalPlaylist";
import { PlaylistEntry } from "./PlaylistEntry";
import { PlaylistLockedScreen } from "./PlaylistLockedScreen";

export default function GroovePlaylistPage() {
  const { data: playlist, isPending, isError, error } = useFinalPlaylist();
  const notPublishedYet = isError && isNotPublishedYet(error);

  if (isError && !notPublishedYet) {
    return <NetworkErrorFallback />;
  }

  if (isPending) {
    return <LoadingFallback />;
  }

  if (notPublishedYet) {
    return <PlaylistLockedScreen />;
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#1c1c1c] text-[#fcfcfc]">
      <div
        className="font-pretendard relative h-[934px] w-full overflow-hidden bg-[#1c1c1c]"
        id="top"
      >
        <h1 className="absolute top-[100px] left-4 text-2xl font-bold">
          GROOVE PLAYLIST
        </h1>

        <div className="absolute top-[153px] right-4 left-4 h-[602px]">
          <ul className="flex h-full flex-col gap-4 overflow-y-auto [mask-image:linear-gradient(to_bottom,transparent,#000_3px,#000_93%,transparent)]">
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
      </div>
    </main>
  );
}
