import { useCallback, useEffect, useRef, useState } from "react";

import type { CampusLocationReading } from "./georeference";

export type CampusLocationStatus =
  "idle" | "locating" | "tracking" | "permission-denied" | "unavailable";

interface CampusLocationState {
  status: CampusLocationStatus;
  reading: CampusLocationReading | null;
  sampleNumber: number;
}

const INITIAL_STATE: CampusLocationState = {
  status: "idle",
  reading: null,
  sampleNumber: 0,
};
const GEOLOCATION_PERMISSION_DENIED = 1;

export const useCampusLocation = () => {
  const [state, setState] = useState<CampusLocationState>(INITIAL_STATE);
  const watchIdRef = useRef<number | null>(null);

  const stop = useCallback(() => {
    if (watchIdRef.current === null || typeof navigator === "undefined") return;
    navigator.geolocation?.clearWatch(watchIdRef.current);
    watchIdRef.current = null;
  }, []);

  const start = useCallback(() => {
    stop();

    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setState({ status: "unavailable", reading: null, sampleNumber: 0 });
      return;
    }

    setState({ status: "locating", reading: null, sampleNumber: 0 });
    watchIdRef.current = navigator.geolocation.watchPosition(
      ({ coords, timestamp }) => {
        setState((current) => ({
          status: "tracking",
          reading: {
            accuracy: coords.accuracy,
            latitude: coords.latitude,
            longitude: coords.longitude,
            timestamp,
          },
          sampleNumber: current.sampleNumber + 1,
        }));
      },
      (error) => {
        stop();
        setState({
          reading: null,
          sampleNumber: 0,
          status:
            error.code === GEOLOCATION_PERMISSION_DENIED
              ? "permission-denied"
              : "unavailable",
        });
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 15_000,
      },
    );
  }, [stop]);

  useEffect(() => stop, [stop]);

  return { ...state, start };
};
