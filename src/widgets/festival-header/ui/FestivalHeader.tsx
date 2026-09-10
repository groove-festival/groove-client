import { useState } from "react";
import { Link } from "react-router";

import headerHome from "../festival-visuals/header-home.png";
import menuIcon from "../festival-visuals/menu.svg";
import { FestivalMenu } from "./FestivalMenu";

interface FestivalHeaderProps {
  className?: string;
  layout?: "fixed" | "canvas";
}

export const FestivalHeader = ({
  className = "",
  layout = "fixed",
}: FestivalHeaderProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isCanvasLayout = layout === "canvas";

  return (
    <>
      {isCanvasLayout ? (
        <header
          className={`absolute top-0 left-0 z-50 h-20 w-full bg-[rgba(28,28,28,0.4)] backdrop-blur-[12px] ${className}`}
        >
          <div className="relative mx-auto flex h-full w-full items-center justify-center px-5">
            <button
              aria-label="메뉴 열기"
              className="absolute top-1/2 left-[21px] size-7 shrink-0 -translate-y-1/2"
              onClick={() => setIsMenuOpen(true)}
              type="button"
            >
              <img alt="" className="size-full" src={menuIcon} />
            </button>
            <Link
              aria-label="GROOVE 홈"
              className="relative block h-[70px] w-[72px] shrink-0 overflow-hidden"
              to="/"
            >
              <img
                alt=""
                className="absolute top-[-23.04%] left-[-24.74%] h-[145.24%] w-[148.51%] max-w-none"
                src={headerHome}
              />
            </Link>
          </div>
        </header>
      ) : (
        <>
          <header
            className={`fixed top-0 left-1/2 z-50 h-16 w-full max-w-[600px] -translate-x-1/2 bg-[rgba(28,28,28,0.4)] backdrop-blur-[12px] ${className}`}
          >
            <div className="relative mx-auto flex h-full max-w-[600px] items-center justify-center px-5">
              <button
                aria-label="메뉴 열기"
                className="absolute top-1/2 left-5 size-7 shrink-0 -translate-y-1/2"
                onClick={() => setIsMenuOpen(true)}
                type="button"
              >
                <img alt="" className="size-full" src={menuIcon} />
              </button>
              <Link
                aria-label="GROOVE 홈"
                className="relative block h-14 w-[58px] shrink-0 overflow-hidden"
                to="/"
              >
                <img
                  alt=""
                  className="absolute top-[-23.04%] left-[-24.74%] h-[145.24%] w-[148.51%] max-w-none"
                  src={headerHome}
                />
              </Link>
            </div>
          </header>

          <div className="h-16 shrink-0" />
        </>
      )}

      <FestivalMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </>
  );
};
