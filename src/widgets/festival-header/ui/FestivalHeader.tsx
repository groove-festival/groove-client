import { useState } from "react";
import { Link } from "react-router";

import headerHome from "../festival-visuals/header-home.png";
import menuIcon from "../festival-visuals/menu.svg";
import { useHeaderVisibility } from "../model/useHeaderVisibility";
import { FestivalMenu } from "./FestivalMenu";

interface FestivalHeaderProps {
  className?: string;
  // 로고를 눌렀을 때 홈으로 이동할지. 끄면 이동하지 않는 로고만 그린다.
  isLogoLinked?: boolean;
  // 좌상단 전체 메뉴 버튼 표시 여부.
  showMenuButton?: boolean;
  // 헤더 위에 고정 배너가 있을 때 그 높이(px)만큼 헤더를 내린다. 숨김 상태에서는
  // 헤더가 배너 뒤로 올라가므로 배너가 헤더보다 위 z-index에 있어야 한다.
  topOffset?: number;
}

const logoImage = (
  <img
    alt=""
    className="absolute top-[-23.04%] left-[-24.74%] h-[145.24%] w-[148.51%] max-w-none"
    src={headerHome}
  />
);

export const FestivalHeader = ({
  className = "",
  isLogoLinked = true,
  showMenuButton = true,
  topOffset = 0,
}: FestivalHeaderProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isHidden = useHeaderVisibility();
  const logoClassName = "relative block h-[70px] w-[72px] shrink-0 overflow-hidden";

  return (
    <>
      <header
        className={`fixed top-0 left-1/2 z-50 h-20 w-full max-w-[600px] -translate-x-1/2 bg-[rgba(28,28,28,0.4)] backdrop-blur-[12px] transition-transform duration-300 ease-out will-change-transform motion-reduce:transition-none ${
          isHidden ? "-translate-y-full" : "translate-y-0"
        } ${className}`}
        style={topOffset ? { top: topOffset } : undefined}
      >
        <div className="relative mx-auto flex h-full w-full items-center justify-center px-5">
          {showMenuButton && (
            <button
              aria-label="메뉴 열기"
              className="absolute top-1/2 left-5 size-7 shrink-0 -translate-y-1/2"
              onClick={() => setIsMenuOpen(true)}
              type="button"
            >
              <img alt="" className="size-full" src={menuIcon} />
            </button>
          )}
          {isLogoLinked ? (
            <Link aria-label="GROOVE 홈" className={logoClassName} to="/">
              {logoImage}
            </Link>
          ) : (
            <span aria-label="GROOVE" className={logoClassName} role="img">
              {logoImage}
            </span>
          )}
        </div>
      </header>

      {showMenuButton && (
        <FestivalMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
      )}
    </>
  );
};
