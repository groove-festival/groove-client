import { useEffect, useRef, useState } from "react";

// 스크롤 방향 기반 상단바 hide/reveal. 다운=숨김, 업=재등장, 최상단은 항상 표시.
// SCROLL_DELTA 미만 미세 스크롤은 무시해 떨림 방지.
const REVEAL_THRESHOLD = 80;
const SCROLL_DELTA = 4;

export const useHeaderVisibility = () => {
  const [isHidden, setIsHidden] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    lastScrollY.current = window.scrollY;

    const handleScroll = () => {
      const currentY = window.scrollY;
      const diff = currentY - lastScrollY.current;

      if (Math.abs(diff) < SCROLL_DELTA) {
        return;
      }

      if (currentY <= REVEAL_THRESHOLD) {
        setIsHidden(false);
      } else {
        setIsHidden(diff > 0);
      }

      lastScrollY.current = currentY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return isHidden;
};
