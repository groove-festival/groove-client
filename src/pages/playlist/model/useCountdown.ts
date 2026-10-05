import { useEffect, useState } from "react";

export interface Countdown {
  hours: number;
  minutes: number;
  seconds: number;
  isElapsed: boolean;
}

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
