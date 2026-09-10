import { useNavigate } from "react-router";

import { SiteHeader } from "@/widgets/site-header";

import { useGroovePlaylist } from "../api/getGroovePlaylist";
import backIcon from "../playlist-visuals/back.svg";
import { PlaylistEntry } from "./PlaylistEntry";

// 축제 기간에 최종 선정 곡을 보여주는 전용 페이지. Figma 805:12036.
export default function GroovePlaylistPage() {
  const navigate = useNavigate();
  const { data: playlist, isPending, isError } = useGroovePlaylist();

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#1c1c1c] text-[#fcfcfc]">
      <div
        className="font-pretendard relative mx-auto h-[934px] w-full max-w-[393px] overflow-hidden bg-[#1c1c1c]"
        id="top"
      >
        <SiteHeader className="left-1/2 -translate-x-1/2" />

        <div className="absolute top-[100px] left-6 flex items-center gap-[58px]">
          <button
            aria-label="뒤로 가기"
            className="size-6 shrink-0"
            onClick={() => navigate("/")}
            type="button"
          >
            <img alt="" className="size-full rotate-90" src={backIcon} />
          </button>
          <h1 className="text-xl font-bold whitespace-nowrap">GROOVE PLAYLIST</h1>
        </div>

        <h2 className="absolute top-[148px] left-4 text-2xl font-bold">PLAYLIST</h2>

        <div className="absolute top-[201px] left-4 h-[602px] w-[361px]">
          <ul className="flex h-full flex-col gap-4 overflow-y-auto [mask-image:linear-gradient(to_bottom,transparent,#000_3px,#000_93%,transparent)]">
            {isPending &&
              Array.from({ length: 7 }, (_, index) => (
                <li className="flex items-center gap-4" key={index}>
                  <div className="size-14 shrink-0 animate-pulse rounded-lg bg-[#323232]" />
                  <div className="h-10 flex-1 animate-pulse rounded bg-[#323232]" />
                </li>
              ))}

            {isError && (
              <li className="text-sm text-[#a2a2a2]">
                플레이리스트를 불러오지 못했어요.
              </li>
            )}

            {playlist?.length === 0 && (
              <li className="text-sm text-[#a2a2a2]">아직 공개된 곡이 없어요.</li>
            )}

            {playlist?.map((entry) => (
              <PlaylistEntry entry={entry} key={entry.id} />
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
