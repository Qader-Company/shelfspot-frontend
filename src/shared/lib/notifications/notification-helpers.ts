import type { PersistedNotification } from "@/shared/types/notification";

export type NotificationTone = "info" | "danger" | "success" | "warning" | "purple";

export interface NotificationDisplay {
  tone: NotificationTone;
  titleKey: string;
  descriptionKey: string;
  icon: string;
  actionUrl?: string;
}

/**
 * Maps a task notification event to display properties
 */
export function getNotificationDisplay(
  notification: PersistedNotification,
): NotificationDisplay {
  const event = notification.data.event;
  const payload = notification.data;
  const action = typeof payload.action === "object" ? payload.action : undefined;
  
  // Build action URL if available
  const actionUrl = action?.resource === "task"
    ? `/dashboard/requests/details?id=${action.id}`
    : undefined;

  switch (event) {
    case "task.published":
      return {
        tone: "info",
        titleKey: "notifications.task.published.title",
        descriptionKey: "notifications.task.published.description",
        icon: "bell",
        actionUrl,
      };

    case "task.reassigned":
      return {
        tone: "warning",
        titleKey: "notifications.task.reassigned.title",
        descriptionKey: "notifications.task.reassigned.description",
        icon: "user-check",
        actionUrl,
      };

    case "task.reopened":
      return {
        tone: "warning",
        titleKey: "notifications.task.reopened.title",
        descriptionKey: "notifications.task.reopened.description",
        icon: "refresh-cw",
        actionUrl,
      };

    case "task.completed":
      return {
        tone: "success",
        titleKey: "notifications.task.completed.title",
        descriptionKey: "notifications.task.completed.description",
        icon: "check-circle",
        actionUrl,
      };

    case "task.failed":
      return {
        tone: "danger",
        titleKey: "notifications.task.failed.title",
        descriptionKey: "notifications.task.failed.description",
        icon: "x-circle",
        actionUrl,
      };

    case "task.worker_cancelled":
      return {
        tone: "danger",
        titleKey: "notifications.task.workerCancelled.title",
        descriptionKey: "notifications.task.workerCancelled.description",
        icon: "user-x",
        actionUrl,
      };

    case "task.rejected":
      return {
        tone: "danger",
        titleKey: "notifications.task.rejected.title",
        descriptionKey: "notifications.task.rejected.description",
        icon: "alert-triangle",
        actionUrl,
      };

    default:
      return {
        tone: "info",
        titleKey: "notifications.default.title",
        descriptionKey: "notifications.default.description",
        icon: "bell",
        actionUrl,
      };
  }
}

/**
 * Formats the notification time relative to now
 */
export function formatNotificationTime(timestamp: string | null): string {
  if (!timestamp) return "";

  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "justNow";
  if (minutes < 60) return `${minutes}m`;
  if (hours < 24) return `${hours}h`;
  if (days < 7) return `${days}d`;
  
  return date.toLocaleDateString();
}

/**
 * Gets priority-based styling
 */
export function getPriorityClass(priority: "normal" | "high"): string {
  return priority === "high" ? "font-semibold" : "";
}
