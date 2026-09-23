import { useState } from "react";

import { useSectionInView } from "@/shared/lib/viewport";

// 섹션이 처음 화면에 들어오면 등장 모션을 시작한다. IntersectionObserver가
// 없는 환경(예: jsdom 테스트)에서는 처음부터 보이게 둔다.
export function useSectionReveal<T extends Element = HTMLElement>() {
  const [isRevealed, setIsRevealed] = useState(
    () => typeof IntersectionObserver === "undefined",
  );
  const ref = useSectionInView<T>({
    onEnterView: () => setIsRevealed(true),
    threshold: 0.15,
  });

  return { ref, isRevealed };
}
