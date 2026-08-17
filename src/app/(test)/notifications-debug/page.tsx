"use client";

import { useEffect, useState } from "react";
import { useNotificationStore } from "@/shared/stores/notification-store";
import { getEchoInstance } from "@/shared/lib/notifications/echo";
import { getAccessToken } from "@/shared/lib/auth/get-access-token";

export default function NotificationsDebugPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const store = useNotificationStore();
  const echo = getEchoInstance();

  useEffect(() => {
    let cancelled = false;

    void getAccessToken().then((token) => {
      if (!cancelled) setAccessToken(token);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  // Force re-render every second to see live updates
  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshKey(k => k + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const echoStatus = echo ? {
    exists: true,
    connector: echo.connector ? "Connected" : "No connector",
    pusherState: echo.connector?.pusher?.connection?.state || "unknown",
    channels: Object.keys((echo as any).channels || {}),
  } : { exists: false };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="rounded-lg bg-white p-6 shadow">
          <h1 className="mb-4 text-2xl font-bold">Notification System Debug</h1>
          <p className="text-sm text-gray-600">
            Refresh Key: {refreshKey} (auto-refreshing every 1s)
          </p>
        </div>

        {/* Store State */}
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="mb-3 text-xl font-semibold">Zustand Store State</h2>
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="font-medium">Notifications Count:</span>
                <span className="ml-2 text-lg font-bold text-blue-600">
                  {store.notifications.length}
                </span>
              </div>
              <div>
                <span className="font-medium">Unread Count:</span>
                <span className="ml-2 text-lg font-bold text-red-600">
                  {store.unreadCount}
                </span>
              </div>
              <div>
                <span className="font-medium">Realtime Connected:</span>
                <span className={`ml-2 font-bold ${store.isRealtimeConnected ? "text-green-600" : "text-red-600"}`}>
                  {store.isRealtimeConnected ? "✅ YES" : "❌ NO"}
                </span>
              </div>
              <div>
                <span className="font-medium">Loading:</span>
                <span className="ml-2">{store.isLoading ? "Yes" : "No"}</span>
              </div>
              <div>
                <span className="font-medium">Portal:</span>
                <span className="ml-2">{store.portal || "none"}</span>
              </div>
              <div>
                <span className="font-medium">Current Page:</span>
                <span className="ml-2">{store.currentPage} / {store.totalPages}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Echo Instance Status */}
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="mb-3 text-xl font-semibold">Echo Instance Status</h2>
          <pre className="overflow-auto rounded bg-gray-100 p-4 text-sm">
            {JSON.stringify(echoStatus, null, 2)}
          </pre>
        </div>

        {/* Access Token */}
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="mb-3 text-xl font-semibold">Access Token</h2>
          <div className="overflow-auto rounded bg-gray-100 p-4">
            <span className={`font-mono text-sm ${accessToken ? "text-green-600" : "text-red-600"}`}>
              {accessToken ? `${accessToken.substring(0, 50)}...` : "❌ No token found"}
            </span>
          </div>
        </div>

        {/* Environment Variables */}
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="mb-3 text-xl font-semibold">Reverb Environment</h2>
          <div className="space-y-2 text-sm">
            <div><span className="font-medium">APP_KEY:</span> {process.env.NEXT_PUBLIC_REVERB_APP_KEY || "❌ Missing"}</div>
            <div><span className="font-medium">HOST:</span> {process.env.NEXT_PUBLIC_REVERB_HOST || "❌ Missing"}</div>
            <div><span className="font-medium">PORT:</span> {process.env.NEXT_PUBLIC_REVERB_PORT || "❌ Missing"}</div>
            <div><span className="font-medium">SCHEME:</span> {process.env.NEXT_PUBLIC_REVERB_SCHEME || "❌ Missing"}</div>
            <div><span className="font-medium">API_BASE:</span> {process.env.NEXT_PUBLIC_API_BASE_URL || "❌ Missing"}</div>
          </div>
        </div>

        {/* Notifications List */}
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="mb-3 text-xl font-semibold">
            Notifications in Store ({store.notifications.length})
          </h2>
          {store.notifications.length === 0 ? (
            <p className="text-gray-500">No notifications in store</p>
          ) : (
            <div className="space-y-3">
              {store.notifications.map((notif, idx) => (
                <div key={notif.id} className="rounded border border-gray-200 p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="font-mono text-xs text-gray-500">#{idx + 1} - ID: {notif.id}</span>
                    <span className={`rounded px-2 py-1 text-xs font-medium ${notif.read_at ? "bg-gray-200" : "bg-red-100 text-red-700"}`}>
                      {notif.read_at ? "Read" : "Unread"}
                    </span>
                  </div>
                  <pre className="overflow-auto text-xs">
                    {JSON.stringify(notif, null, 2)}
                  </pre>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Test Instructions */}
        <div className="rounded-lg bg-blue-50 p-6">
          <h2 className="mb-3 text-xl font-semibold">Debugging Steps</h2>
          <ol className="list-inside list-decimal space-y-2 text-sm">
            <li>Open browser console (F12) to see detailed logs</li>
            <li>Verify "Realtime Connected" shows ✅ YES above</li>
            <li>Check Echo Instance has channels subscribed</li>
            <li>Send a test notification from your Laravel backend</li>
            <li>Watch the console for log messages starting with 🔵, 🔔, 📬, 📦, ✨</li>
            <li>Observe if the notification count increases above</li>
            <li>Check the "Notifications in Store" section for new items</li>
          </ol>
          
          <div className="mt-4 rounded bg-yellow-50 p-4 text-sm">
            <p className="font-semibold">Expected Console Log Flow:</p>
            <pre className="mt-2 text-xs">
{`🔵 Echo: Raw notification received from channel
🔵 Echo: Notification keys
🔵 Echo: Notification structure
📬 Hook: New notification received
📬 Hook: Calling upsertRealtimeNotification
🔔 Store: Received realtime notification
📦 Store: Converted to persisted format
✨ Store: Adding new notification
📊 Store: New state
✅ Hook: upsertRealtimeNotification completed
🎨 NotificationButton render (UI updates)`}</pre>
          </div>
        </div>
      </div>
    </div>
  );
}
