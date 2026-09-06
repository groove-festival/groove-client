import { Navigate, Route, Routes } from "react-router";

import GroovePlaylistPage from "@/pages/groove-playlist";
import PlaylistPage from "@/pages/playlist";

export const AppRouter = () => {
  return (
    <Routes>
      <Route index element={<PlaylistPage />} />
      <Route path="playlist" element={<GroovePlaylistPage />} />
      <Route path="*" element={<Navigate replace to="/" />} />
    </Routes>
  );
};
