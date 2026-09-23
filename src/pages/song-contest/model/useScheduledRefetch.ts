import { useEffect } from "react";

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

    const delay = Math.min(remainingMs, 2_147_483_647);
    const id = window.setTimeout(onReach, delay);

    return () => window.clearTimeout(id);
  }, [targetIso, onReach]);
}
