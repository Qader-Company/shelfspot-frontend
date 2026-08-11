"use client";

import { useEffect, useCallback, useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useNotificationStore } from "@/shared/stores/notification-store";
import {
  getNotifications,
  getUnreadCount,
  markNotificationRead,
  markAllNotificationsRead,
  type Portal,
} from "@/shared/services/notifications-api";
import {
  createEchoInstance,
  subscribeToUserChannel,
  disconnectEcho,
} from "@/shared/lib/notifications/echo";
import { getAccessToken } from "@/shared/lib/auth/get-access-token";
import { showNotificationToast } from "@/shared/lib/notifications/notification-toast";
import { formatNotification } from "@/shared/lib/notifications/format-notification";
import type { RealtimeNotification } from "@/shared/types/notification";

interface UseNotificationsOptions {
  portal: Portal;
  userId: number | null;
  enabled?: boolean;
  perPage?: number;
}

export function useNotifications({
  portal,
  userId,
  enabled = true,
  perPage = 20,
}: UseNotificationsOptions) {
  const queryClient = useQueryClient();
  const channelRef = useRef<ReturnType<typeof subscribeToUserChannel> | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const t = useTranslations("dashboard.notifications");
  const locale = useLocale();
  const router = useRouter();
  
  const {
    notifications,
    unreadCount,
    isRealtimeConnected,
    setNotifications,
    upsertRealtimeNotification,
    setUnreadCount,
    setRealtimeConnected,
    setPagination,
    setLoading,
    setPortal,
    markAsRead: storeMarkAsRead,
    markAllAsRead: storeMarkAllAsRead,
  } = useNotificationStore();

  // Fetch access token on mount
  useEffect(() => {
    getAccessToken().then(setAccessToken);
  }, []);

  // Set portal on mount
  useEffect(() => {
    setPortal(portal);
  }, [portal, setPortal]);

  // Fetch notifications
  const { data: notificationsData, isLoading: isLoadingNotifications } = useQuery({
    queryKey: ["notifications", portal, perPage],
    queryFn: () => getNotifications(portal, { per_page: perPage }),
    enabled: enabled && !!accessToken,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });

  // Fetch unread count
  const { data: unreadCountData } = useQuery({
    queryKey: ["notifications", portal, "unread-count"],
    queryFn: () => getUnreadCount(portal),
    enabled: enabled && !!accessToken,
    refetchInterval: 60000, // Refresh every minute
    refetchOnWindowFocus: true,
  });

  // Update store when data changes
  useEffect(() => {
    if (notificationsData?.data?.data) {
      setNotifications(notificationsData.data.data);
      setPagination(
        notificationsData.data.meta.current_page,
        notificationsData.data.meta.last_page,
        notificationsData.data.meta.total,
      );
    }
  }, [notificationsData, setNotifications, setPagination]);

  useEffect(() => {
    if (unreadCountData !== undefined) {
      setUnreadCount(unreadCountData);
    }
  }, [unreadCountData, setUnreadCount]);

  useEffect(() => {
    setLoading(isLoadingNotifications);
  }, [isLoadingNotifications, setLoading]);

  // Mark notification as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: (notificationId: string) =>
      markNotificationRead(portal, notificationId),
    onSuccess: (data, notificationId) => {
      storeMarkAsRead(notificationId);
      queryClient.invalidateQueries({ queryKey: ["notifications", portal, "unread-count"] });
    },
  });

  // Mark all as read mutation
  const markAllAsReadMutation = useMutation({
    mutationFn: () => markAllNotificationsRead(portal),
    onSuccess: () => {
      storeMarkAllAsRead();
      queryClient.invalidateQueries({ queryKey: ["notifications", portal] });
      queryClient.invalidateQueries({ queryKey: ["notifications", portal, "unread-count"] });
    },
  });

  // Setup realtime connection
  const setupRealtime = useCallback(() => {
    console.log("🔧 setupRealtime called:", { userId, accessToken: accessToken ? "present" : "missing", enabled });
    
    if (!userId || !accessToken || !enabled) {
      console.log("⏸️ Skipping realtime setup:", { userId, hasToken: !!accessToken, enabled });
      return;
    }

    try {
      console.log("🚀 Creating Echo instance...");
      
      // Create Echo instance
      createEchoInstance({
        userId,
      });

      console.log("📡 Subscribing to user channel...");

      // Subscribe to user's private channel
      const channel = subscribeToUserChannel(
        userId,
        (notification: RealtimeNotification) => {
          console.log("📬 Hook: New notification received:", notification);
          console.log("📬 Hook: Notification type:", typeof notification, notification);
          
          // Handle incoming realtime notification
          console.log("📬 Hook: Calling upsertRealtimeNotification");
          upsertRealtimeNotification(notification);
          console.log("✅ Hook: upsertRealtimeNotification completed");
          
          // Show toast notification
          try {
            const formatted = formatNotification({
              id: notification.id,
              type: notification.type,
              data: notification,
              read_at: null,
              created_at: new Date().toISOString(),
            }, portal);
            const titleKey = formatted.titleKey as Parameters<typeof t>[0];
            const descriptionKey = formatted.descriptionKey as Parameters<typeof t>[0];
            const values = {
              taskId: formatted.taskId ?? "",
              paymentId: formatted.paymentId ?? "",
              amount: formatted.amount ?? "",
              currency: formatted.currency ?? "",
            };
            
            showNotificationToast(notification, {
              locale,
              translations: {
                title: formatted.customTitle ||
                  (t.has(titleKey) ? t(titleKey) : t("fallback.title")),
                description: formatted.customMessage ||
                  (t.has(descriptionKey)
                    ? t(descriptionKey, values)
                    : t("fallback.description")),
              },
              actionLabel: t("viewDetails"),
              onAction: () => {
                router.push(formatted.actionUrl);
              },
            });
          } catch (error) {
            console.error("Failed to show toast notification:", error);
          }
        },
        () => {
          // Successfully subscribed
          setRealtimeConnected(true);
          console.log("✅ Realtime notifications connected");
          
          // Refetch notifications and unread count on successful connection
          queryClient.invalidateQueries({ queryKey: ["notifications", portal] });
          queryClient.invalidateQueries({ queryKey: ["notifications", portal, "unread-count"] });
        },
        (error) => {
          // Connection error
          console.error("❌ Realtime connection error:", error);
          setRealtimeConnected(false);
        },
      );

      channelRef.current = channel;
    } catch (error) {
      console.error("❌ Failed to setup realtime notifications:", error);
      setRealtimeConnected(false);
    }
  }, [userId, accessToken, enabled, portal, upsertRealtimeNotification, setRealtimeConnected, queryClient, t, locale, router]);

  // Setup realtime on mount and when dependencies change
  useEffect(() => {
    setupRealtime();

    // Cleanup on unmount
    return () => {
      if (channelRef.current) {
        channelRef.current.stopListening(".notification");
      }
      disconnectEcho();
      setRealtimeConnected(false);
    };
  }, [setupRealtime, setRealtimeConnected, accessToken]); // Added accessToken as dependency

  // Refresh notifications (useful after reconnection)
  const refresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["notifications", portal] });
    queryClient.invalidateQueries({ queryKey: ["notifications", portal, "unread-count"] });
  }, [portal, queryClient]);

  return {
    notifications,
    unreadCount,
    isRealtimeConnected,
    isLoading: isLoadingNotifications,
    markAsRead: markAsReadMutation.mutate,
    markAllAsRead: markAllAsReadMutation.mutate,
    refresh,
  };
}
