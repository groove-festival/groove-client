import { useEffect, useState } from "react";

// 일정 간격마다 갱신되는 현재 시각. 접수 일정에 따라 화면 단계를 자동으로
// 전환하는 데 쓴다.
export function useNow(intervalMs = 1000): Date {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);

  return now;
}
