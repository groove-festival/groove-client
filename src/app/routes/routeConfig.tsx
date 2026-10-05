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

const lazyPage = (load: () => Promise<{ default: ComponentType }>) => () =>
  load().then((page) => ({ Component: page.default }));

export const routes: RouteObject[] = [
  {
    element: <RootBoundary />,

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

      { path: "admin", lazy: lazyPage(() => import("@/pages/admin")) },

      {
        path: "pub/:boothId/:tableCode",
        lazy: lazyPage(() => import("@/pages/booth-order")),
      },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
];
