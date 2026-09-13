import { useLayoutEffect } from "react";
import { Outlet, useLocation } from "react-router";

import { FestivalHeader } from "@/widgets/festival-header";

// 전 페이지 공용 레이아웃. 헤더를 한 번만 마운트해 라우트가 바뀌어도
// 헤더 인스턴스와 스크롤 hide/reveal 상태가 유지되도록 한다.
export const RootLayout = () => {
  const { pathname } = useLocation();

  // 라우트가 바뀌면 스크롤을 상단으로 되돌린다. View Transitions 스냅샷이
  // 이전 스크롤 위치로 찍혀 전환이 튀는 것을 막는다. (PlaylistPage 등 자체
  // 스크롤 리셋을 가진 페이지와 중복돼도 top 고정이라 무해하다.)
  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname]);

  return (
    <>
      <FestivalHeader />
      {/* 라우트 전환 모션은 이 본문 래퍼(page-content)에만 건다. 헤더는 밖에
          두어 스냅샷 대상에서 제외 → 전환 중에도 라이브로 렌더돼 깜빡이지 않는다.
          (헤더가 fixed + backdrop-blur라 스냅샷으로 굳으면 뒤 배경과 어긋나 깜빡임) */}
      <div className="[view-transition-name:page-content]">
        <Outlet />
      </div>
    </>
  );
};
