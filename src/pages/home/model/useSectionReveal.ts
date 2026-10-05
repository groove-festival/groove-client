import { useState } from "react";

import { useSectionInView } from "@/shared/lib/viewport";

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
