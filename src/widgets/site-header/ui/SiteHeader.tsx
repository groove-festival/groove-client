import headerHome from "../site-header-visuals/header-home.png";
import menuIcon from "../site-header-visuals/menu.svg";

interface SiteHeaderProps {
  // 페이지별 가로 위치만 넘긴다. 바 자체 스타일은 고정한다.
  className?: string;
}

// 모든 화면 상단에 노출되는 공통 바(메뉴 + 홈). Figma 227:3203.
export const SiteHeader = ({ className = "" }: SiteHeaderProps) => {
  return (
    <header
      className={`absolute top-0 z-20 flex h-20 w-[400px] items-center bg-[rgba(28,28,28,0.4)] py-[5px] pr-[163px] pl-[21px] backdrop-blur-[12px] ${className}`}
    >
      <button aria-label="메뉴 열기" className="size-7 shrink-0" type="button">
        <img alt="" className="size-full" src={menuIcon} />
      </button>
      <a
        aria-label="GROOVE 홈"
        className="relative ml-[116px] block h-[70px] w-[72px] shrink-0 overflow-hidden"
        href="#top"
      >
        <img
          alt=""
          className="absolute top-[-23.04%] left-[-24.74%] h-[145.24%] w-[148.51%] max-w-none"
          src={headerHome}
        />
      </a>
    </header>
  );
};
