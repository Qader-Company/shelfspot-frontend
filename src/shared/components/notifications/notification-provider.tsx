"use client";

import { useEffect } from "react";
import { useNotifications } from "@/shared/hooks/use-notifications";
import { useSession } from "@/shared/hooks/use-session";
import { getAuthContextFromCookie } from "@/shared/lib/auth/client-session";
import type { Portal } from "@/shared/services/notifications-api";

interface NotificationProviderProps {
  children: React.ReactNode;
  portal: Portal;
}

/**
 * Provider component that initializes real-time notifications
 * Place this near the root of your authenticated app
 */
export function NotificationProvider({
  children,
  portal,
}: NotificationProviderProps) {
  const { userId, isLoading } = useSession(portal);

  // Initialize notifications when user is authenticated
  const { isRealtimeConnected } = useNotifications({
    portal,
    userId,
    enabled: !isLoading && !!userId,
  });

  useEffect(() => {
    if (isRealtimeConnected) {
      console.log("✅ Real-time notifications connected");
    }
  }, [isRealtimeConnected]);

  return <>{children}</>;
}
