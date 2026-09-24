import { useEffect } from "react";

// 지정한 시각(ISO)에 도달하면 콜백을 한 번 실행한다. 카운트다운 0, 접수 마감,
// 최종 공개처럼 화면이 다음 단계로 넘어가야 하는 순간에 festival/status를 다시
// 불러오는 데 쓴다. 이미 지난 시각이거나 값이 없으면 아무것도 하지 않는다.
export function useScheduledRefetch(
  targetIso: string | undefined,
  onReach: () => void,
): void {
  useEffect(() => {
    if (!targetIso) {
      return;
    }

    const remainingMs = new Date(targetIso).getTime() - Date.now();
    if (Number.isNaN(remainingMs) || remainingMs <= 0) {
      return;
    }

    // setTimeout 지연 상한(약 24.8일)을 넘기면 즉시 발화하므로 잘라둔다.
    const delay = Math.min(remainingMs, 2_147_483_647);
    const id = window.setTimeout(onReach, delay);

    return () => window.clearTimeout(id);
  }, [targetIso, onReach]);
}
