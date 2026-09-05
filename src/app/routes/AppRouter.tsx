import { Navigate, Route, Routes } from "react-router";

import PlaylistPage from "@/pages/playlist";

export const AppRouter = () => {
  return (
    <Routes>
      <Route index element={<PlaylistPage />} />
      <Route path="playlist" element={<PlaylistPage />} />
      <Route path="*" element={<Navigate replace to="/" />} />
    </Routes>
  );
};
