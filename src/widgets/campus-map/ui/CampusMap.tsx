import {
  getIsSafariBrowser,
  getRestrictedInAppBrowser,
} from "@/shared/lib/in-app-browser";
import {
  FestivalMap,
  IosSafariLocationGuide,
  type FestivalMapFocusRequest,
} from "@/shared/ui";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { CAMPUS_MAP_ALT, CAMPUS_MAP_SIZE } from "../model/places";
import {
  type CampusLocationProjection,
  projectCampusLocation,
} from "../model/georeference";
import { useCampusLocation } from "../model/useCampusLocation";
import {
  type CampusMapBox,
  type CampusMapView,
  getViewScale,
  toMapFocus,
} from "../model/view";
import { CampusMapLayer, type CampusMapLayerProps } from "./CampusMapLayer";
import { CampusInAppLocationDialog } from "./CampusInAppLocationDialog";
import { CampusLocationControl } from "./CampusLocationControl";

const DEFAULT_LABEL_WIDTHS = [170, 140] as const;
const PRECISE_INITIAL_FIX_METERS = 50;
const COARSE_FIX_WAIT_MS = 10_000;

const CAMPUS_MAP_SOURCE = {
  width: CAMPUS_MAP_SIZE.width,
  height: CAMPUS_MAP_SIZE.height,
  alt: CAMPUS_MAP_ALT,
};

interface CampusMapProps extends Omit<
  CampusMapLayerProps,
  "labelVisibleScale" | "location"
> {
  box: CampusMapBox;
  initialView: CampusMapView;

  closestWidth: number;

  focus?: CampusMapView | null;

  resetTo?: CampusMapView | null;

  className?: string;
  controlsClassName?: string;

  bordered?: boolean;

  labelWidths?: readonly [hidden: number, shown: number];
}

export const CampusMap = ({
  box,
  initialView,
  closestWidth,
  focus = null,
  resetTo = null,
  className = "",
  controlsClassName = "",
  bordered = false,
  labelWidths = DEFAULT_LABEL_WIDTHS,
  ...layerProps
}: CampusMapProps) => {
  const { reading, start, status } = useCampusLocation();
  const [restrictedInAppBrowser] = useState(() => getRestrictedInAppBrowser());
  const [safariBrowser] = useState(getIsSafariBrowser);
  const [isInAppLocationDialogOpen, setIsInAppLocationDialogOpen] = useState(false);
  const location = useMemo(
    () => (reading ? projectCampusLocation(reading) : null),
    [reading],
  );
  const [focusRequest, setFocusRequest] = useState<FestivalMapFocusRequest | null>(
    null,
  );
  const focusRequestIdRef = useRef(0);
  const hasAutoFocusedRef = useRef(false);
  const bestInitialLocationRef = useRef<CampusLocationProjection | null>(null);
  const coarseFixTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearCoarseFixTimer = useCallback(() => {
    if (coarseFixTimerRef.current === null) return;
    clearTimeout(coarseFixTimerRef.current);
    coarseFixTimerRef.current = null;
  }, []);

  const focusLocation = useCallback(
    (projection: CampusLocationProjection) => {
      focusRequestIdRef.current += 1;
      setFocusRequest({
        ...toMapFocus(box, projection.focus),
        requestId: focusRequestIdRef.current,
      });
    },
    [box],
  );

  const completeInitialFocus = useCallback(
    (projection: CampusLocationProjection) => {
      if (projection.boundaryStatus === "outside") return;
      hasAutoFocusedRef.current = true;
      clearCoarseFixTimer();
      focusLocation(projection);
    },
    [clearCoarseFixTimer, focusLocation],
  );

  useEffect(() => {
    if (
      status !== "tracking" ||
      !reading ||
      !location ||
      location.boundaryStatus === "outside" ||
      hasAutoFocusedRef.current
    ) {
      return;
    }

    const best = bestInitialLocationRef.current;
    if (!best || location.accuracyMeters < best.accuracyMeters) {
      bestInitialLocationRef.current = location;
    }

    if (reading.accuracy <= PRECISE_INITIAL_FIX_METERS) {
      completeInitialFocus(location);
      return;
    }

    if (coarseFixTimerRef.current !== null) return;
    coarseFixTimerRef.current = setTimeout(() => {
      coarseFixTimerRef.current = null;
      const bestAvailable = bestInitialLocationRef.current;
      if (bestAvailable) completeInitialFocus(bestAvailable);
    }, COARSE_FIX_WAIT_MS);
  }, [completeInitialFocus, location, reading, status]);

  useEffect(() => {
    if (status === "tracking" || status === "locating" || status === "idle") return;
    clearCoarseFixTimer();
  }, [clearCoarseFixTimer, status]);

  useEffect(() => clearCoarseFixTimer, [clearCoarseFixTimer]);

  const handleLocationClick = () => {
    if (restrictedInAppBrowser) {
      setIsInAppLocationDialogOpen(true);
      return;
    }

    if (status === "tracking" && location) {
      completeInitialFocus(location);
      return;
    }

    clearCoarseFixTimer();
    hasAutoFocusedRef.current = false;
    bestInitialLocationRef.current = null;
    start();
  };

  const showLocationAccuracyNotice =
    location !== null && location.boundaryStatus !== "outside";
  const showSafariPermissionGuide = safariBrowser && status === "permission-denied";

  return (
    <div className="flex w-full flex-col gap-1.5">
      <div
        className="relative w-full"
        style={{ aspectRatio: `${box.width} / ${box.height}` }}
      >
        <div className="absolute inset-0">
          <FestivalMap
            className={`size-full ${className}`}
            controlsClassName={controlsClassName}
            focus={focus && toMapFocus(box, focus)}
            focusRequest={focusRequest}
            initialCenter={initialView}
            initialScale={getViewScale(box, initialView.width)}
            maxScale={getViewScale(box, closestWidth)}
            resetTo={resetTo && toMapFocus(box, resetTo)}
            source={CAMPUS_MAP_SOURCE}
          >
            <CampusMapLayer
              labelVisibleScale={[
                getViewScale(box, labelWidths[0]),
                getViewScale(box, labelWidths[1]),
              ]}
              location={location}
              {...layerProps}
            />
          </FestivalMap>
        </div>

        <CampusLocationControl
          boundaryStatus={location?.boundaryStatus ?? null}
          onClick={handleLocationClick}
          status={status}
        />

        {bordered && (
          <div className="pointer-events-none absolute inset-0 rounded-3xl border border-[#767676]" />
        )}
      </div>

      {(showLocationAccuracyNotice || showSafariPermissionGuide) && (
        <div className="flex w-full flex-col gap-2">
          {showLocationAccuracyNotice && (
            <p className="px-1 text-center text-[11px] leading-4 font-medium text-[#a2a2a2]">
              GPS 환경에 따라 실제 위치와 차이가 있을 수 있어요
            </p>
          )}

          {showSafariPermissionGuide && (
            <aside
              aria-label="Safari 위치 권한 설정 방법"
              className="w-full rounded-2xl border border-white/20 bg-[rgba(28,28,28,0.58)] px-4 py-3 backdrop-blur-xl"
            >
              <IosSafariLocationGuide />
            </aside>
          )}
        </div>
      )}

      {isInAppLocationDialogOpen && (
        <CampusInAppLocationDialog
          onClose={() => setIsInAppLocationDialogOpen(false)}
        />
      )}
    </div>
  );
};
