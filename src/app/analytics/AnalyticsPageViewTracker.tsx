import { useEffect } from "react";
import { useLocation } from "react-router";

import { trackAnalyticsPageView } from "./initialize-analytics";

export const AnalyticsPageViewTracker = () => {
  const location = useLocation();

  useEffect(() => {
    trackAnalyticsPageView(location.pathname);
  }, [location.pathname]);

  return null;
};
