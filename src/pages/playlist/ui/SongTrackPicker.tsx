import type { SongTrack } from "../api/searchSongs";
import { searchErrorMessage } from "../model/songRequestErrorMessages";
import type { useSongTrackPicker } from "../model/useSongTrackPicker";

interface SongTrackPickerProps {
  picker: ReturnType<typeof useSongTrackPicker>;
}

const TrackSummary = ({ track }: { track: SongTrack }) => (
  <>
    {track.albumCoverUrl ? (
      <img
        alt=""
        className="size-12 shrink-0 rounded-lg object-cover"
        src={track.albumCoverUrl}
      />
    ) : (
      <div className="size-12 shrink-0 rounded-lg bg-[#5d5d5d]" />
    )}
    <div className="flex min-w-0 flex-1 flex-col">
      <p className="truncate text-sm font-semibold text-[#fcfcfc]">{track.title}</p>
      <p className="truncate text-xs text-[#a2a2a2]">{track.artist}</p>
    </div>
  </>
);

export const SongTrackPicker = ({ picker }: SongTrackPickerProps) => {
  const {
    keyword,
    setKeyword,
    selectedTrack,
    isSearching,
    isSearchError,
    searchError,
    didSearch,
    searchResults,
    showResults,
    resultsRef,
    runSearch,
    pickTrack,
    clearTrack,
  } = picker;

  return (
    <div>
      <label className="block text-sm leading-[17px] font-medium" htmlFor="song-search">
        음악 검색 <span className="text-[#00ffff]">*</span>
      </label>
      <div className="relative mt-3 flex gap-3">
        <input
          className="h-[55px] min-w-0 flex-1 rounded-2xl border border-[#fcfcfc] bg-[#323232] px-[22px] text-sm font-medium text-[#fcfcfc] outline-none placeholder:text-[#a2a2a2] focus:border-[#00ffff]"
          id="song-search"
          onChange={(event) => setKeyword(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              runSearch();
            }
          }}
          placeholder="곡 제목 또는 아티스트 검색"
          type="search"
          value={keyword}
        />
        <button
          className="h-[57px] w-[111px] shrink-0 rounded-2xl bg-[#5d00ff] text-sm font-semibold disabled:opacity-60"
          disabled={isSearching || keyword.trim().length === 0}
          onClick={runSearch}
          type="button"
        >
          검색
        </button>

        {/* 결과는 입력창 아래 오버레이로 띄워 폼 높이를 유지한다. */}
        {showResults && (
          <ul
            className="themed-scrollbar absolute top-full right-0 left-0 z-20 mt-2 flex max-h-[200px] flex-col gap-2 overflow-y-auto rounded-2xl border border-[#5d5d5d] bg-[#1c1c1c] p-2 shadow-xl"
            data-clarity-mask="true"
            ref={resultsRef}
          >
            {searchResults.map((track) => (
              <li key={track.trackId}>
                <button
                  className="flex w-full items-center gap-3 rounded-2xl border border-[#5d5d5d] bg-[#323232] p-3 text-left"
                  onClick={() => pickTrack(track)}
                  type="button"
                >
                  <TrackSummary track={track} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <p className="mt-1 text-[10px] leading-3 text-[#a2a2a2]">
        * 실제 음원이 있는 곡만 검색·선택할 수 있습니다.
      </p>

      {selectedTrack ? (
        <div
          className="mt-3 flex items-center gap-3 rounded-2xl border border-[#00ffff] bg-[#323232] p-3"
          data-clarity-mask="true"
        >
          <TrackSummary track={selectedTrack} />
          <button
            className="shrink-0 text-xs font-semibold text-[#00ffff] underline"
            onClick={clearTrack}
            type="button"
          >
            변경
          </button>
        </div>
      ) : (
        <>
          {isSearchError && (
            <p className="mt-2 text-xs leading-[15px] text-[#ff5b5b]">
              {searchErrorMessage(searchError)}
            </p>
          )}
          {didSearch && searchResults.length === 0 && (
            <p className="mt-2 text-xs leading-[15px] text-[#a2a2a2]">
              검색 결과가 없어요. 다른 검색어로 시도해 주세요.
            </p>
          )}
        </>
      )}
    </div>
  );
};
