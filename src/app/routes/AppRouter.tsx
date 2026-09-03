import { Navigate, Route, Routes } from "react-router";

import HomePage from "@/pages/home";

export const AppRouter = () => {
  return (
    <Routes>
      <Route index element={<HomePage />} />
      <Route path="*" element={<Navigate replace to="/" />} />
    </Routes>
  );
};
