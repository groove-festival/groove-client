import { type RouteObject } from "react-router";

import AdminPage from "@/pages/admin";
import BoothDetailPage from "@/pages/booth-detail";
import BoothListPage from "@/pages/booth-list";
import ComingSoonPage from "@/pages/coming-soon";
import CreditsPage from "@/pages/credits";
import GroovePlaylistPage from "@/pages/groove-playlist";
import NotFoundPage from "@/pages/not-found";
import PlaylistPage from "@/pages/playlist";
import SongContestPage from "@/pages/song-contest";

import { RootBoundary } from "./RootBoundary";
import { RootLayout } from "./RootLayout";

// 데이터 라우터 구성. react-router의 View Transitions(라우트 전환 모션)는
// 데이터 라우터에서만 동작하므로 선언형 <Routes> 대신 이 구성을 사용한다.
export const routes: RouteObject[] = [
  {
    element: <RootBoundary />,
    children: [
      {
        element: <RootLayout />,
        children: [
          { index: true, element: <PlaylistPage /> },
          { path: "pub", element: <BoothListPage /> },
          { path: "pub/:boothId", element: <BoothDetailPage /> },
          { path: "playlist", element: <GroovePlaylistPage /> },
          { path: "contest", element: <SongContestPage /> },
          { path: "admin", element: <AdminPage /> },
          { path: "credits", element: <CreditsPage /> },
          { path: "coming-soon", element: <ComingSoonPage /> },
        ],
      },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
];
