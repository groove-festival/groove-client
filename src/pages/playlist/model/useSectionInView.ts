import { useEffect, useRef } from "react";
import type { RefObject } from "react";

interface UseSectionInViewOptions {
  // 섹션이 처음으로 뷰포트에 들어온 순간 한 번만 호출한다.
  onEnterView: () => void;
  threshold?: number;
  rootMargin?: string;
}

// 대상 섹션이 처음 화면에 들어오면 콜백을 한 번 실행한다. 스크롤 위치 파생
// 상태를 별도로 저장하지 않고, IntersectionObserver를 쓸 수 없는 환경
// (예: jsdom 테스트)에서는 관찰을 건너뛴다.
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
