import { Navigate, Route, Routes } from "react-router";

import ComingSoonPage from "@/pages/coming-soon";
import CreditsPage from "@/pages/credits";
import HomePage from "@/pages/home";

export const AppRouter = () => {
  return (
    <Routes>
      <Route index element={<HomePage />} />
      <Route path="playlist" element={<HomePage />} />
      <Route path="credits" element={<CreditsPage />} />
      <Route path="coming-soon" element={<ComingSoonPage />} />
      <Route path="*" element={<Navigate replace to="/" />} />
    </Routes>
  );
};
