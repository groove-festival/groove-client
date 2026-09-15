import { useLayoutEffect } from "react";

import { PLAYLIST_BOTTOM_ANCHOR_ID } from "./playlistAnchors";

const PLAYLIST_BOTTOM_HASH = `#${PLAYLIST_BOTTOM_ANCHOR_ID}`;

// 새로고침이나 뒤로 가기로 진입해도 페이지를 맨 위에서 시작한다.
export function usePlaylistEntryScroll(): void {
  useLayoutEffect(() => {
    const previousScrollRestoration = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";

    if (window.location.hash === PLAYLIST_BOTTOM_HASH) {
      window.history.replaceState(
        null,
        "",
        `${window.location.pathname}${window.location.search}`,
      );
    }
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });

    return () => {
      window.history.scrollRestoration = previousScrollRestoration;
    };
  }, []);
}
