import { toast } from "sonner";
import {
  Bell,
  CircleCheck,
  CircleX,
  ClipboardList,
  RefreshCcw,
  RotateCcw,
  TriangleAlert,
  UserRoundX,
} from "lucide-react";
import type { RealtimeNotification } from "@/shared/types/notification";
import { getNotificationTone } from "./format-notification";

interface NotificationToastOptions {
  locale?: string;
  translations: {
    title: string;
    description: string;
  };
  onAction?: () => void;
  actionLabel?: string;
}

/**
 * Shows a toast notification for a realtime notification
 */
export function showNotificationToast(
  notification: RealtimeNotification,
  options: NotificationToastOptions,
) {
  const { translations, onAction, actionLabel, locale = "en" } = options;
  const tone = getNotificationTone(notification.event);

  // Map tone to toast type
  const toastType = tone === "danger" ? "error" : tone === "success" ? "success" : "info";

  // Icon based on notification event
  const icon = getNotificationIcon(notification.event);

  const toastConfig = {
    description: translations.description,
    icon,
    duration: 5000, // 5 seconds
    ...(onAction && actionLabel
      ? {
          action: {
            label: actionLabel,
            onClick: onAction,
          },
        }
      : {}),
  };

  // Show appropriate toast type
  if (toastType === "error") {
    toast.error(translations.title, toastConfig);
  } else if (toastType === "success") {
    toast.success(translations.title, toastConfig);
  } else {
    toast.info(translations.title, toastConfig);
  }
}

/**
 * Gets an emoji icon for the notification event
 */
function getNotificationIcon(event: string) {
  const iconClassName = "size-5";

  switch (event) {
    case "task.published":
      return <ClipboardList className={iconClassName} aria-hidden="true" />;
    case "task.reassigned":
      return <RefreshCcw className={iconClassName} aria-hidden="true" />;
    case "task.reopened":
      return <RotateCcw className={iconClassName} aria-hidden="true" />;
    case "task.completed":
      return <CircleCheck className={iconClassName} aria-hidden="true" />;
    case "task.failed":
      return <CircleX className={iconClassName} aria-hidden="true" />;
    case "task.worker_cancelled":
      return <UserRoundX className={iconClassName} aria-hidden="true" />;
    case "task.rejected":
      return <CircleX className={iconClassName} aria-hidden="true" />;
    default:
      return <Bell className={iconClassName} aria-hidden="true" />;
  }
}

/**
 * Simple notification toast without translations
 */
export function showSimpleNotificationToast(
  title: string,
  description: string,
  type: "info" | "success" | "error" | "warning" = "info",
) {
  const iconClassName = "size-5";
  const icon =
    type === "success" ? (
      <CircleCheck className={iconClassName} aria-hidden="true" />
    ) : type === "error" ? (
      <CircleX className={iconClassName} aria-hidden="true" />
    ) : type === "warning" ? (
      <TriangleAlert className={iconClassName} aria-hidden="true" />
    ) : (
      <Bell className={iconClassName} aria-hidden="true" />
    );

  const toastConfig = {
    description,
    icon,
    duration: 5000,
  };

  if (type === "error") {
    toast.error(title, toastConfig);
  } else if (type === "success") {
    toast.success(title, toastConfig);
  } else if (type === "warning") {
    toast.warning(title, toastConfig);
  } else {
    toast.info(title, toastConfig);
  }
}
