import { useCallback, useEffect, useRef, useState } from "react";

import {
  type CampusLocationFilterState,
  updateCampusLocationFilter,
} from "./campusLocationFilter";
import type { CampusLocationReading } from "./georeference";

export type CampusLocationStatus =
  "idle" | "locating" | "tracking" | "permission-denied" | "unavailable";

interface CampusLocationState {
  status: CampusLocationStatus;
  reading: CampusLocationReading | null;
}

const INITIAL_STATE: CampusLocationState = {
  status: "idle",
  reading: null,
};
const GEOLOCATION_PERMISSION_DENIED = 1;

export const useCampusLocation = () => {
  const [state, setState] = useState<CampusLocationState>(INITIAL_STATE);
  const watchIdRef = useRef<number | null>(null);
  const filterStateRef = useRef<CampusLocationFilterState | null>(null);

  const stop = useCallback(() => {
    if (watchIdRef.current === null || typeof navigator === "undefined") return;
    navigator.geolocation?.clearWatch(watchIdRef.current);
    watchIdRef.current = null;
  }, []);

  const start = useCallback(() => {
    stop();

    if (typeof navigator === "undefined" || !navigator.geolocation) {
      filterStateRef.current = null;
      setState({ status: "unavailable", reading: null });
      return;
    }

    filterStateRef.current = null;
    setState({ status: "locating", reading: null });
    watchIdRef.current = navigator.geolocation.watchPosition(
      ({ coords, timestamp }) => {
        const nextFilterState = updateCampusLocationFilter(filterStateRef.current, {
          accuracy: coords.accuracy,
          latitude: coords.latitude,
          longitude: coords.longitude,
          timestamp,
        });
        if (!nextFilterState) return;

        filterStateRef.current = nextFilterState;
        setState({ status: "tracking", reading: nextFilterState.reading });
      },
      (error) => {
        stop();
        filterStateRef.current = null;
        setState({
          reading: null,
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
