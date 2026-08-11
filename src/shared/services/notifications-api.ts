import { apiClient } from "@/shared/lib/api/client";
import type {
  NotificationResponse,
  UnreadCountResponse,
  MarkReadResponse,
  MarkAllReadResponse,
} from "@/shared/types/notification";

export type Portal = "admin" | "company" | "worker";

/**
 * Fetches paginated notifications for the given portal
 */
export async function getNotifications(
  portal: Portal,
  params?: {
    per_page?: number;
    page?: number;
    unread_only?: boolean;
  },
): Promise<NotificationResponse> {
  const queryParams = new URLSearchParams();
  
  if (params?.per_page) {
    queryParams.append("per_page", String(params.per_page));
  }
  if (params?.page) {
    queryParams.append("page", String(params.page));
  }
  if (params?.unread_only) {
    queryParams.append("unread_only", "1");
  }

  const query = queryParams.toString();
  const url = `/api/${portal}/notifications${query ? `?${query}` : ""}`;

  const response = await apiClient.get<NotificationResponse>(url);
  return response.data;
}

/**
 * Fetches the unread notification count
 */
export async function getUnreadCount(portal: Portal): Promise<number> {
  const response = await apiClient.get<UnreadCountResponse>(
    `/api/${portal}/notifications/unread-count`,
  );
  return response.data.data.unread_count;
}

/**
 * Marks a single notification as read
 */
export async function markNotificationRead(
  portal: Portal,
  notificationId: string,
): Promise<MarkReadResponse> {
  const response = await apiClient.patch<MarkReadResponse>(
    `/api/${portal}/notifications/${notificationId}/read`,
  );
  return response.data;
}

/**
 * Marks all notifications as read
 */
export async function markAllNotificationsRead(
  portal: Portal,
): Promise<MarkAllReadResponse> {
  const response = await apiClient.patch<MarkAllReadResponse>(
    `/api/${portal}/notifications/read-all`,
  );
  return response.data;
}
