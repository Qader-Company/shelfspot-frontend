import type {
  GenericNotificationPayload,
  PersistedNotification,
} from "@/shared/types/notification";
import type { Portal } from "@/shared/services/notifications-api";

export interface FormattedNotification {
  id: string;
  titleKey: string;
  descriptionKey: string;
  event: string;
  priority: "normal" | "high";
  taskId?: number;
  paymentId?: number;
  amount?: number;
  currency?: string;
  customTitle?: string;
  customMessage?: string;
  read: boolean;
  createdAt: string;
  occurredAt: string;
  actionUrl: string;
  category: string;
}

/**
 * Formats a persisted notification for UI display
 */
export function formatNotification(
  notification: PersistedNotification,
  portal: Portal = "company",
): FormattedNotification {
  const { id, data, read_at, created_at } = notification;
  const payload = data as GenericNotificationPayload;
  const { event, priority, occurred_at, category } = payload;

  // Base formatted notification
  const formatted: FormattedNotification = {
    id,
    titleKey: `events.${event}.title`,
    descriptionKey: `events.${event}.description`,
    event,
    priority: priority === "high" ? "high" : "normal",
    read: !!read_at,
    createdAt: created_at || new Date().toISOString(),
    occurredAt: occurred_at || created_at || new Date().toISOString(),
    actionUrl: getActionUrl(payload, portal),
    category: category || "task",
  };

  // Add category-specific fields
  formatted.taskId = toNumericId(payload.task_id);
  formatted.paymentId = toNumericId(payload.payment_id);
  formatted.amount = typeof payload.amount === "number" ? payload.amount : undefined;
  formatted.currency = typeof payload.currency === "string" ? payload.currency : undefined;
  formatted.customTitle = firstText(payload.title, payload.meta?.title);
  formatted.customMessage = firstText(
    payload.message,
    payload.description,
    payload.body,
    payload.meta?.message,
    payload.meta?.description,
  );

  if (!formatted.customTitle && !isKnownEvent(event)) {
    formatted.customTitle = humanizeEvent(event);
  }
  if (!formatted.customMessage && !isKnownEvent(event)) {
    const payloadAction = typeof payload.action === "object" ? payload.action : undefined;
    const resource = payloadAction?.resource || payload.category;
    const resourceId = payloadAction?.id ?? formatted.taskId ?? formatted.paymentId;
    const reference = resource
      ? `${humanizeEvent(resource)}${resourceId ? ` #${resourceId}` : ""}`
      : `Notification ${id.slice(-8)}`;
    formatted.customMessage = `${humanizeEvent(event)} · ${reference}`;
  }

  return formatted;
}

/**
 * Gets the action URL based on resource type
 */
function getActionUrl(
  data: GenericNotificationPayload,
  portal: Portal,
): string {
  const action = typeof data.action === "object" ? data.action : undefined;
  const explicitPath = firstText(
    typeof data.action === "string" ? data.action : undefined,
    action?.url,
    action?.href,
    action?.path,
  );
  if (explicitPath?.startsWith("/")) {
    if (portal === "admin" && explicitPath.startsWith("/dashboard/requests")) {
      return explicitPath.replace("/dashboard/requests", "/admin/requests");
    }
    return explicitPath;
  }

  const eventResource = data.event.split(".")[0];
  const resource = action?.resource || data.category || eventResource;
  const id = firstId(
    action?.id,
    data.task_id,
    data.request_id,
    data.payment_id,
    data.meta?.task_id,
    data.meta?.request_id,
    data.meta?.payment_id,
    data.meta?.id,
  );
  const root = portal === "admin" ? "/admin" : "/dashboard";

  switch (resource) {
    case "task":
    case "request":
    case "requests":
      return id ? `${root}/requests/${id}` : `${root}/requests`;
    case "payment":
    case "payments":
      return portal === "admin" && id
        ? `/admin/payments/${id}`
        : portal === "admin" ? "/admin/payments" : "/dashboard/payment";
    default:
      return root;
  }
}

const knownEvents = new Set([
  "task.published", "task.reassigned", "task.reopened", "task.completed",
  "task.failed", "task.worker_cancelled", "task.rejected", "payment.completed",
  "payment.pending", "payment.failed", "payment.refunded", "system.maintenance",
  "system.update", "account.verified", "account.suspended",
]);

function isKnownEvent(event: string) {
  return knownEvents.has(event);
}

function firstText(...values: unknown[]) {
  return values.find((value): value is string =>
    typeof value === "string" && value.trim().length > 0,
  )?.trim();
}

function toNumericId(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && /^\d+$/.test(value)) return Number(value);
  return undefined;
}

function firstId(...values: unknown[]) {
  return values.find((value): value is string | number =>
    (typeof value === "number" && Number.isFinite(value)) ||
    (typeof value === "string" && value.trim().length > 0),
  );
}

function humanizeEvent(event: string) {
  const text = event.replace(/[._-]+/g, " ").replace(/\s+/g, " ").trim();
  return text ? text.charAt(0).toUpperCase() + text.slice(1) : "Notification";
}

/**
 * Gets the tone/color for a notification based on event type
 */
export function getNotificationTone(
  event: string,
): "info" | "danger" | "success" | "warning" {
  switch (event) {
    // Task events
    case "task.published":
      return "info";
    case "task.completed":
      return "success";
    case "task.rejected":
    case "task.failed":
      return "danger";
    case "task.reassigned":
    case "task.reopened":
    case "task.worker_cancelled":
      return "warning";
    
    // Payment events
    case "payment.completed":
      return "success";
    case "payment.failed":
      return "danger";
    case "payment.pending":
    case "payment.refunded":
      return "warning";
    
    // System/Account events
    case "account.verified":
      return "success";
    case "account.suspended":
      return "danger";
    case "system.maintenance":
    case "system.update":
      return "info";
    
    default:
      return "info";
  }
}

/**
 * Formats a relative time string (e.g., "2 minutes ago")
 */
export function formatRelativeTime(dateString: string, locale = "en"): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  const formatter = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });

  if (diffInSeconds < 60) {
    return formatter.format(-diffInSeconds, "second");
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return formatter.format(-diffInMinutes, "minute");
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return formatter.format(-diffInHours, "hour");
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return formatter.format(-diffInDays, "day");
  }

  return date.toLocaleDateString(locale);
}
