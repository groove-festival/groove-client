import { useEffect, useRef, useState } from "react";

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
