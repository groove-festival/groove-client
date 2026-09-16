import { useEffect, useRef, useState } from "react";

import { type SongTrack, useSearchSongs } from "../api/searchSongs";
import {
  toDurationBucket,
  toResultCountBucket,
  toSafeErrorCode,
  trackPlaylistEvent,
} from "./playlistTelemetry";

interface UseSongTrackPickerOptions {
  onSearchStart: () => void;
  onTrackChange: (trackId: string) => void;
}

// 검색 결과 표시와 선택을 소유한다. 폼에는 선택된 trackId만 전달한다.
export function useSongTrackPicker({
  onSearchStart,
  onTrackChange,
}: UseSongTrackPickerOptions) {
  const [keyword, setKeyword] = useState("");
  const [selectedTrack, setSelectedTrack] = useState<SongTrack | null>(null);
  const [isResultsClosed, setIsResultsClosed] = useState(false);
  const resultsRef = useRef<HTMLUListElement>(null);
  const search = useSearchSongs();

  const searchResults = search.data ?? [];
  const showResults = !selectedTrack && !isResultsClosed && searchResults.length > 0;

  const runSearch = () => {
    const trimmed = keyword.trim();
    if (!trimmed) {
      return;
    }

    onSearchStart();
    setIsResultsClosed(false);
    const startedAt = performance.now();
    trackPlaylistEvent({ eventName: "song_search_attempt" });
    search.mutate(trimmed, {
      onError: (error) => {
        trackPlaylistEvent({
          duration_bucket: toDurationBucket(performance.now() - startedAt),
          error_code: toSafeErrorCode(error),
          eventName: "song_search_failure",
        });
      },
      onSuccess: (tracks) => {
        const durationBucket = toDurationBucket(performance.now() - startedAt);
        const resultCountBucket = toResultCountBucket(tracks.length);

        if (resultCountBucket === "0") {
          trackPlaylistEvent({
            duration_bucket: durationBucket,
            eventName: "song_search_empty",
          });
          return;
        }

        trackPlaylistEvent({
          duration_bucket: durationBucket,
          eventName: "song_search_success",
          result_count_bucket: resultCountBucket,
        });
      },
    });
  };

  const pickTrack = (track: SongTrack) => {
    setSelectedTrack(track);
    onTrackChange(track.trackId);
    trackPlaylistEvent({ eventName: "song_select" });
  };

  const clearTrack = () => {
    setSelectedTrack(null);
    onTrackChange("");
  };

  const resetPicker = () => {
    setKeyword("");
    setSelectedTrack(null);
    search.reset();
  };

  useEffect(() => {
    if (!showResults) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (!resultsRef.current?.contains(event.target as Node)) {
        setIsResultsClosed(true);
      }
    };
    document.addEventListener("mousedown", handlePointerDown);

    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [showResults]);

  return {
    keyword,
    setKeyword,
    selectedTrack,
    isSearching: search.isPending,
    isSearchError: search.isError,
    searchError: search.error,
    didSearch: search.isSuccess,
    searchResults,
    showResults,
    resultsRef,
    runSearch,
    pickTrack,
    clearTrack,
    resetPicker,
  };
}
