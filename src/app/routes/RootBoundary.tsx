import { Outlet, useLocation } from "react-router";

import { AnalyticsPageViewTracker } from "@/app/analytics";
import { SiteFooter } from "@/widgets/site-footer";

export const RootBoundary = () => {
  const { pathname } = useLocation();
  const isAdminRoute = pathname === "/admin" || pathname.startsWith("/admin/");

  return (
    <>
      <AnalyticsPageViewTracker />
      <Outlet />
      {!isAdminRoute && <SiteFooter />}
    </>
  );
};
