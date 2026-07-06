import axios from "axios";

import { API_CONFIG } from "@/config/api";

export const apiClient = axios.create({
  baseURL: API_CONFIG.browserBaseUrl || undefined,
  timeout: API_CONFIG.timeoutMs,
  withCredentials: true,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});
