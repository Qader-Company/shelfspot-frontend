import axios from "axios";

import type { ApiError, ApiValidationErrorResponse } from "@/shared/lib/api/types";

export function normalizeApiError(error: unknown): ApiError {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as
      | (Partial<ApiError> & ApiValidationErrorResponse)
      | undefined;

    return {
      code: data?.code ?? error.code ?? "HTTP_ERROR",
      message: data?.message ?? error.message,
      status: error.response?.status ?? 0,
      fieldErrors: data?.fieldErrors ?? data?.errors,
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

export function formatApiError(error: unknown): string {
  const normalized = normalizeApiError(error);
  const validationMessages = normalized.fieldErrors
    ? [...new Set(Object.values(normalized.fieldErrors).flat())]
    : [];

  return validationMessages.length > 0
    ? validationMessages.join(" ")
    : normalized.message;
}
