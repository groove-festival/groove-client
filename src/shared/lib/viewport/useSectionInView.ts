import { useEffect, useRef } from "react";
import type { RefObject } from "react";

interface UseSectionInViewOptions {
  onEnterView: () => void;
  threshold?: number;
  rootMargin?: string;
}

export function useSectionInView<T extends Element = HTMLElement>({
  onEnterView,
  threshold = 0.3,
  rootMargin = "0px",
}: UseSectionInViewOptions): RefObject<T | null> {
  const ref = useRef<T>(null);
  const onEnterViewRef = useRef(onEnterView);
  const hasFiredRef = useRef(false);

  useEffect(() => {
    onEnterViewRef.current = onEnterView;
  });

  useEffect(() => {
    const element = ref.current;

    if (!element || typeof IntersectionObserver === "undefined") {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (hasFiredRef.current) {
          return;
        }

        if (entries.some((entry) => entry.isIntersecting)) {
          hasFiredRef.current = true;
          observer.disconnect();
          onEnterViewRef.current();
        }
      },
      { threshold, rootMargin },
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  return ref;
}
