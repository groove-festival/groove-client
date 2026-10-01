import { type ComponentType } from "react";
import { type RouteObject } from "react-router";

import BoothDetailPage from "@/pages/booth-detail";
import BoothListPage from "@/pages/booth-list";
import ComingSoonPage from "@/pages/coming-soon";
import ContestStoryPage from "@/pages/contest-story";
import EventPage from "@/pages/event";
import GroovePlaylistPage from "@/pages/groove-playlist";
import HomePage from "@/pages/home";
import NotFoundPage from "@/pages/not-found";
import SongContestPage from "@/pages/song-contest";
import { LoadingFallback } from "@/shared/ui";

import { RootBoundary } from "./RootBoundary";
import { RootLayout } from "./RootLayout";

// 일반 관람객이 거의 들르지 않는 화면은 들어갈 때만 코드를 내려받는다.
const lazyPage = (load: () => Promise<{ default: ComponentType }>) => () =>
  load().then((page) => ({ Component: page.default }));

// 데이터 라우터 구성. react-router의 View Transitions(라우트 전환 모션)는
// 데이터 라우터에서만 동작하므로 선언형 <Routes> 대신 이 구성을 사용한다.
export const routes: RouteObject[] = [
  {
    element: <RootBoundary />,
    // 나눠 받는 화면으로 바로 들어오면 코드를 받는 동안 이 화면을 보여준다.
    hydrateFallbackElement: <LoadingFallback />,
    children: [
      {
        element: <RootLayout />,
        children: [
          { index: true, element: <HomePage /> },
          { path: "pub", element: <BoothListPage /> },
          { path: "pub/:boothId", element: <BoothDetailPage /> },
          { path: "playlist", element: <GroovePlaylistPage /> },
          { path: "story", element: <ContestStoryPage /> },
          { path: "contest", element: <SongContestPage /> },
          { path: "event", element: <EventPage /> },
          { path: "credits", lazy: lazyPage(() => import("@/pages/credits")) },
          { path: "coming-soon", element: <ComingSoonPage /> },
        ],
      },
      // 관리 화면은 축제 참여자용 헤더·내비게이션과 분리한다.
      { path: "admin", lazy: lazyPage(() => import("@/pages/admin")) },
      // 테이블 QR 주문은 전역 레이아웃 밖의 별도 흐름이다. 페이지가 상단바를
      // 직접 그리고(미완료 주문 배너 포함) 단계 전환 시 스크롤도 직접 올린다.
      {
        path: "pub/:boothId/:tableCode",
        lazy: lazyPage(() => import("@/pages/booth-order")),
      },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
];
