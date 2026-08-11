"use client";

import { useEffect, useState } from "react";
import { useNotifications } from "@/shared/hooks/use-notifications";
import { useSession } from "@/shared/hooks/use-session";
import { useNotificationStore } from "@/shared/stores/notification-store";
import { getAccessToken } from "@/shared/lib/auth/get-access-token";
import type { Portal } from "@/shared/services/notifications-api";

interface NotificationDebugProps {
  portal: Portal;
}

/**
 * Debug component to log notification system status
 * Add this to your dashboard to see what's happening
 */
export function NotificationDebug({ portal }: NotificationDebugProps) {
  const { userId, profile, isLoading: isLoadingProfile } = useSession(portal);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  
  const {
    notifications,
    unreadCount,
    isRealtimeConnected,
    isLoading,
  } = useNotifications({
    portal,
    userId,
    enabled: !!userId,
  });

  const store = useNotificationStore();

  // Fetch access token
  useEffect(() => {
    getAccessToken().then(setAccessToken);
  }, []);

  useEffect(() => {
    console.log("🔍 Notification Debug Status:");
    console.log("  Portal:", portal);
    console.log("  User ID:", userId);
    console.log("  Profile loading:", isLoadingProfile);
    console.log("  Profile:", profile);
    console.log("  Access Token:", accessToken ? "✓ Present" : "✗ Missing");
    console.log("  Realtime Connected:", isRealtimeConnected ? "✓ Yes" : "✗ No");
    console.log("  Notifications loading:", isLoading);
    console.log("  Notifications count:", notifications.length);
    console.log("  Unread count:", unreadCount);
    console.log("  Store state:", {
      notifications: store.notifications.length,
      unreadCount: store.unreadCount,
      isRealtimeConnected: store.isRealtimeConnected,
      portal: store.portal,
    });
  }, [
    portal,
    userId,
    isLoadingProfile,
    profile,
    accessToken,
    isRealtimeConnected,
    isLoading,
    notifications.length,
    unreadCount,
    store,
  ]);

  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 z-50 max-w-sm rounded-lg border border-amber-500 bg-amber-50 p-4 text-xs dark:bg-amber-950">
      <div className="mb-2 font-bold text-amber-900 dark:text-amber-100">
        🔍 Notification Debug
      </div>
      <div className="space-y-1 text-amber-800 dark:text-amber-200">
        <div>Portal: <strong>{portal}</strong></div>
        <div>User ID: <strong>{userId || "loading..."}</strong></div>
        <div>
          Access Token: {accessToken ? "✓" : "✗"}
        </div>
        <div>
          Realtime: {isRealtimeConnected ? "✓ Connected" : "✗ Disconnected"}
        </div>
        <div>Notifications: <strong>{notifications.length}</strong></div>
        <div>Unread: <strong>{unreadCount}</strong></div>
      </div>
    </div>
  );
}
