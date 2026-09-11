import { Outlet } from "react-router";

import { FestivalHeader } from "@/widgets/festival-header";

// 전 페이지 공용 레이아웃. 헤더를 한 번만 마운트해 라우트가 바뀌어도
// 헤더 인스턴스와 스크롤 hide/reveal 상태가 유지되도록 한다.
export const RootLayout = () => {
  return (
    <>
      <FestivalHeader />
      <Outlet />
    </>
  );
};
