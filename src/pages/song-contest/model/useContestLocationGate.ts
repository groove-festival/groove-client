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

  const [watchKey, setWatchKey] = useState(0);

  useEffect(() => {
    if (!enabled || !hasGeolocation()) return;

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
