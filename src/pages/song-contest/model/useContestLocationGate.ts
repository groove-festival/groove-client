import { useCallback, useEffect, useState } from "react";

import { isWithinContestVenueRadius } from "./venueLocation";

export type LocationGateStatus =
  "checking" | "in-range" | "out-of-range" | "permission-denied" | "unavailable";

function hasGeolocation(): boolean {
  return Boolean(navigator.geolocation);
}

const GEOLOCATION_PERMISSION_DENIED = 1;

export function useContestLocationGate(enabled = true) {
  const [status, setStatus] = useState<LocationGateStatus>(() =>
    enabled && hasGeolocation() ? "checking" : "unavailable",
  );
  // 권한 거부 후 "다시 시도"는 watchPosition을 새로 걸어 권한 재요청을
  // 트리거해야 하므로, 키를 올려 이펙트를 재실행시킨다.
  const [watchKey, setWatchKey] = useState(0);

  useEffect(() => {
    if (!enabled || !hasGeolocation()) return;

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
      (error) =>
        setStatus(
          error.code === GEOLOCATION_PERMISSION_DENIED
            ? "permission-denied"
            : "unavailable",
        ),
      { enableHighAccuracy: true, timeout: 10_000 },
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [enabled, watchKey]);

  const retry = useCallback(() => {
    if (!enabled || !hasGeolocation()) return;
    setStatus("checking");
    setWatchKey((key) => key + 1);
  }, [enabled]);

  return { status, retry };
}
