import { Outlet, useLocation } from "react-router";

import { AnalyticsPageViewTracker } from "@/app/analytics";
import { SiteFooter } from "@/widgets/site-footer";

// 최상위 경계. 라우트가 바뀔 때마다 분석 페이지뷰를 기록하고(useLocation 사용),
// 404를 포함한 모든 라우트를 감싼다. 관리 화면은 운영 도구이므로 축제용 정책
// 푸터를 노출하지 않는다.
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
