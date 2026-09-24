import { useCallback, useEffect, useState } from "react";

import { isWithinContestVenueRadius } from "./venueLocation";

export type LocationGateStatus =
  "checking" | "in-range" | "out-of-range" | "unavailable";

// 투표 카드는 행사장 반경(100m) 안에서만 연다 (PRD FR-2.1). 권한 거부·기기
// 미지원·조회 실패는 전부 "확인 불가"로 묶어 같은 안내 화면을 보여준다 —
// 셋을 구분하는 디자인이 없고, 사용자 입장에선 어차피 "다시 시도"가 유일한
// 다음 동작이기 때문이다.
function hasGeolocation(): boolean {
  return Boolean(navigator.geolocation);
}

export function useContestLocationGate() {
  const [status, setStatus] = useState<LocationGateStatus>(() =>
    hasGeolocation() ? "checking" : "unavailable",
  );
  // 권한 거부 후 "다시 시도"는 watchPosition을 새로 걸어 권한 재요청을
  // 트리거해야 하므로, 키를 올려 이펙트를 재실행시킨다.
  const [watchKey, setWatchKey] = useState(0);

  useEffect(() => {
    if (!hasGeolocation()) return;

    // 걸어서 반경 안으로 들어오면 자동으로 잠금이 풀리도록 한 번만 조회하지
    // 않고 계속 추적한다.
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const inRange = isWithinContestVenueRadius(
          { latitude: position.coords.latitude, longitude: position.coords.longitude },
          position.coords.accuracy,
        );
        setStatus(inRange ? "in-range" : "out-of-range");
      },
      () => setStatus("unavailable"),
      { enableHighAccuracy: true, timeout: 10_000 },
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [watchKey]);

  const retry = useCallback(() => {
    if (!hasGeolocation()) return;
    setStatus("checking");
    setWatchKey((key) => key + 1);
  }, []);

  return { status, retry };
}
