import { normalizeApiError } from "@/shared/lib/api/errors";

export type MerchandiserErrorField = "fullName" | "email" | "phone" | "loginEnabled" | "temporaryPassword" | "confirmPassword";

const fields: Record<string, MerchandiserErrorField> = {
  name: "fullName", full_name: "fullName", fullName: "fullName",
  email: "email", phone: "phone", phone_number: "phone",
  login_enabled: "loginEnabled", loginEnabled: "loginEnabled",
  password: "temporaryPassword", temporary_password: "temporaryPassword", temporaryPassword: "temporaryPassword",
  password_confirmation: "confirmPassword", confirmPassword: "confirmPassword",
};

export function merchandiserFormErrors(error: unknown, t: (key: string) => string) {
  const normalized = normalizeApiError(error);
  const fieldErrors: Partial<Record<MerchandiserErrorField, string>> = {};
  for (const [key, messages] of Object.entries(normalized.fieldErrors ?? {})) {
    const field = fields[key] ?? fields[key.split(".").at(-1) ?? ""];
    if (!field) continue;
    const text = (Array.isArray(messages) ? messages : [messages]).join(" ");
    const duplicate = /unique|already|taken|exists|مستخدم|موجود|مسجل/i.test(text);
    fieldErrors[field] = t(duplicate && (field === "email" || field === "phone")
      ? `errors.${field}Exists`
      : `errors.${field}`);
  }

  let key = "saveError";
  if (normalized.status === 422 || (normalized.status === 409 && Object.keys(fieldErrors).length)) key = "errors.validation";
  else if (normalized.status === 401) key = "errors.session";
  else if (normalized.status === 403) key = "errors.permission";
  else if (normalized.status === 404) key = "errors.notFound";
  else if (normalized.status === 409) key = "errors.conflict";
  else if (normalized.status === 429) key = "errors.rateLimit";
  else if (normalized.status >= 500) key = "errors.server";
  else if (normalized.status === 0) key = "errors.network";
  return { fieldErrors, message: t(key) };
}
