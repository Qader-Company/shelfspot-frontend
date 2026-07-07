import axios from "axios";

import type { ApiError } from "@/shared/lib/api/types";

export function normalizeApiError(error: unknown): ApiError {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as Partial<ApiError> | undefined;

    return {
      code: data?.code ?? error.code ?? "HTTP_ERROR",
      message: data?.message ?? error.message,
      status: error.response?.status ?? 0,
      fieldErrors: data?.fieldErrors,
      requestId:
        data?.requestId ?? error.response?.headers["x-request-id"]?.toString(),
    };
  }

  return {
    code: "UNKNOWN_ERROR",
    message: error instanceof Error ? error.message : "",
    status: 0,
  };
}
