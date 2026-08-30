import axios from "axios";

import { appConfig } from "@/shared/config";

export const httpClient = axios.create({
  baseURL: appConfig.apiBaseUrl,
  timeout: 10_000,
  withCredentials: true,
  headers: {
    Accept: "application/json",
  },
});
