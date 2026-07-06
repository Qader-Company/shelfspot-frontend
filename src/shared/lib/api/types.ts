export interface ApiError {
  code: string;
  message: string;
  status: number;
  fieldErrors?: Record<string, string[]>;
  requestId?: string;
}
