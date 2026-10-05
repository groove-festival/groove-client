import { useLayoutEffect } from "react";
import { Outlet, useLocation } from "react-router";

import { FestivalHeader } from "@/widgets/festival-header";

export const RootLayout = () => {
  const { pathname } = useLocation();

  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname]);

  return (
    <>
      <FestivalHeader />
      <Outlet />
    </>
  );
};
