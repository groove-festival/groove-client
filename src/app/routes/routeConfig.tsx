import { type RouteObject } from "react-router";

import AdminPage from "@/pages/admin";
import BoothDetailPage from "@/pages/booth-detail";
import BoothListPage from "@/pages/booth-list";
import BoothOrderPage from "@/pages/booth-order";
import ComingSoonPage from "@/pages/coming-soon";
import CreditsPage from "@/pages/credits";
import EventPage from "@/pages/event";
import GroovePlaylistPage from "@/pages/groove-playlist";
import HomePage from "@/pages/home";
import NotFoundPage from "@/pages/not-found";
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
          { index: true, element: <HomePage /> },
          { path: "pub", element: <BoothListPage /> },
          { path: "pub/:boothId", element: <BoothDetailPage /> },
          { path: "playlist", element: <GroovePlaylistPage /> },
          { path: "contest", element: <SongContestPage /> },
          { path: "event", element: <EventPage /> },
          { path: "admin", element: <AdminPage /> },
          { path: "credits", element: <CreditsPage /> },
          { path: "coming-soon", element: <ComingSoonPage /> },
        ],
      },
      // 테이블 QR 주문은 전역 레이아웃 밖의 별도 흐름이다. 페이지가 상단바를
      // 직접 그리고(미완료 주문 배너 포함) 단계 전환 시 스크롤도 직접 올린다.
      { path: "pub/:boothId/:tableCode", element: <BoothOrderPage /> },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
];
