import { Outlet } from "react-router";

import { AnalyticsPageViewTracker } from "@/app/analytics";
import { FestivalFooter } from "@/widgets/festival-footer";

// 최상위 경계. 라우트가 바뀔 때마다 분석 페이지뷰를 기록하고(useLocation 사용),
// 404를 포함한 모든 라우트를 감싼다.
export const RootBoundary = () => (
  <>
    <AnalyticsPageViewTracker />
    <Outlet />
    <FestivalFooter />
  </>
);
