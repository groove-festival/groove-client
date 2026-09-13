import { type RouteObject } from "react-router";

import AdminPromoPage from "@/pages/admin-promo";
import ComingSoonPage from "@/pages/coming-soon";
import CreditsPage from "@/pages/credits";
import GroovePlaylistPage from "@/pages/groove-playlist";
import NotFoundPage from "@/pages/not-found";
import PlaylistPage from "@/pages/playlist";

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
          { path: "playlist", element: <GroovePlaylistPage /> },
          { path: "admin", element: <AdminPromoPage /> },
          { path: "credits", element: <CreditsPage /> },
          { path: "coming-soon", element: <ComingSoonPage /> },
        ],
      },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
];
