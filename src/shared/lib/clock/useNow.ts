import { useEffect, useState } from "react";

// 일정 간격마다 갱신되는 현재 시각. 시간에 따라 바뀌는 화면(접수 단계,
// 현재 진행 중인 일정 등)을 자동으로 전환하는 데 쓴다.
export function useNow(intervalMs = 1000): Date {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);

  return now;
}
