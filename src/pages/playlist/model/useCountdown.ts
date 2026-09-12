import { useEffect, useState } from "react";

export interface Countdown {
  hours: number;
  minutes: number;
  seconds: number;
  isElapsed: boolean;
}

// 남은 시간을 시/분/초로 나눈다. 시(hour)는 자리수 제한이 없어 100시간을
// 넘으면 3자리 이상이 된다. target이 없으면 0으로 둔다(아직 접수 시각을 모름).
function computeCountdown(target: Date | null, fromMs: number): Countdown {
  if (!target) {
    return { hours: 0, minutes: 0, seconds: 0, isElapsed: false };
  }

  const remainingMs = Math.max(0, target.getTime() - fromMs);
  const totalSeconds = Math.floor(remainingMs / 1000);

  return {
    hours: Math.floor(totalSeconds / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
    isElapsed: remainingMs === 0,
  };
}

// target까지 남은 시간을 1초 간격으로 갱신한다. target이 null이면 타이머를 걸지
// 않는다. 호출부는 target 참조를 안정적으로 유지한다(예: useMemo).
export function useCountdown(target: Date | null): Countdown {
  const [countdown, setCountdown] = useState(() =>
    computeCountdown(target, Date.now()),
  );

  useEffect(() => {
    const tick = () => setCountdown(computeCountdown(target, Date.now()));

    tick();

    if (!target) {
      return;
    }

    const id = setInterval(tick, 1000);

    return () => clearInterval(id);
  }, [target]);

  return countdown;
}
