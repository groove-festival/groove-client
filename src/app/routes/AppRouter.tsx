import { Navigate, Route, Routes } from "react-router";

import AdminPromoPage from "@/pages/admin-promo";
import ComingSoonPage from "@/pages/coming-soon";
import CreditsPage from "@/pages/credits";
import GroovePlaylistPage from "@/pages/groove-playlist";
import PlaylistPage from "@/pages/playlist";

import { RootLayout } from "./RootLayout";

export const AppRouter = () => {
  return (
    <Routes>
      <Route element={<RootLayout />}>
        <Route index element={<PlaylistPage />} />
        <Route path="playlist" element={<GroovePlaylistPage />} />
        <Route path="admin" element={<AdminPromoPage />} />
        <Route path="credits" element={<CreditsPage />} />
        <Route path="coming-soon" element={<ComingSoonPage />} />
        <Route path="*" element={<Navigate replace to="/" />} />
      </Route>
    </Routes>
  );
};
