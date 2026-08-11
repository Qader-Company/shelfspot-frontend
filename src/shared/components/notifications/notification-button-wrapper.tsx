"use client";

import { NotificationButton } from "@/shared/components/dashboard/notification-button";
import { useNotifications } from "@/shared/hooks/use-notifications";
import { useSession } from "@/shared/hooks/use-session";
import type { Portal } from "@/shared/services/notifications-api";

interface NotificationButtonWrapperProps {
  label: string;
  portal: Portal;
}

/**
 * Wrapper component that connects NotificationButton to real-time notifications
 */
export function NotificationButtonWrapper({
  label,
  portal,
}: NotificationButtonWrapperProps) {
  const { userId } = useSession(portal);
  
  const { markAsRead, markAllAsRead } = useNotifications({
    portal,
    userId,
    enabled: !!userId,
  });

  return (
    <NotificationButton
      label={label}
      onMarkAsRead={markAsRead}
      onMarkAllAsRead={markAllAsRead}
      portal={portal}
    />
  );
}
