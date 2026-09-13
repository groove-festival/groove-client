import { createBrowserRouter, RouterProvider } from "react-router";

import { appConfig } from "@/shared/config";

import { routes } from "./routeConfig";

const router = createBrowserRouter(routes, { basename: appConfig.basePath });

export const AppRouter = () => <RouterProvider router={router} />;
