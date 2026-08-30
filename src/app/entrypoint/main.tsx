import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { initializeAnalytics } from "@/app/analytics";
import { AppComposition } from "@/app/composition";
import "@/app/styles/index.css";

initializeAnalytics();

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Application root element was not found.");
}

createRoot(rootElement).render(
  <StrictMode>
    <AppComposition />
  </StrictMode>,
);
