"use client";

import { useState, useEffect } from "react";
import { useSession } from "@/shared/hooks/use-session";
import { useNotifications } from "@/shared/hooks/use-notifications";
import { useNotificationStore } from "@/shared/stores/notification-store";
import { createEchoInstance, subscribeToUserChannel, disconnectEcho, getEchoInstance } from "@/shared/lib/notifications/echo";
import { getAccessToken } from "@/shared/lib/auth/get-access-token";
import type { Portal } from "@/shared/services/notifications-api";
import type { RealtimeNotification } from "@/shared/types/notification";

export default function NotificationsTestPage() {
  const [portal, setPortal] = useState<Portal>("admin");
  const [manualUserId, setManualUserId] = useState<string>("");
  const [manualToken, setManualToken] = useState<string>("");
  const [connectionStatus, setConnectionStatus] = useState<string>("Disconnected");
  const [statusColor, setStatusColor] = useState<string>("slate");
  const [realtimeEvents, setRealtimeEvents] = useState<Array<{ label: string; payload: any }>>([]);
  
  const { userId: sessionUserId, profile } = useSession(portal);
  const accessToken = getAccessToken();
  
  const { notifications, unreadCount, isRealtimeConnected, refresh } = useNotifications({
    portal,
    userId: sessionUserId,
    enabled: true,
  });

  // Reverb configuration from env
  const reverbConfig = {
    key: process.env.NEXT_PUBLIC_REVERB_APP_KEY || "",
    host: process.env.NEXT_PUBLIC_REVERB_HOST || "",
    port: process.env.NEXT_PUBLIC_REVERB_PORT || "",
    scheme: process.env.NEXT_PUBLIC_REVERB_SCHEME || "https",
  };

  // Update status based on realtime connection
  useEffect(() => {
    if (isRealtimeConnected) {
      setStatus("Connected & Subscribed", "emerald");
    } else if (getEchoInstance()) {
      setStatus("Connecting...", "amber");
    } else {
      setStatus("Disconnected", "slate");
    }
  }, [isRealtimeConnected]);

  const setStatus = (text: string, color: string = "slate") => {
    setConnectionStatus(text);
    setStatusColor(color);
  };

  const appendRealtime = (label: string, payload: any) => {
    setRealtimeEvents(prev => [...prev, { label, payload }]);
  };

  const handleManualConnect = () => {
    const userId = manualUserId ? parseInt(manualUserId) : sessionUserId;
    const token = manualToken || accessToken;

    if (!userId || !token) {
      appendRealtime("Configuration error", { 
        message: "Bearer token and authenticated user ID are required." 
      });
      return;
    }

    try {
      const apiOrigin = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/api\/v1$/, "") || "";
      
      // Disconnect existing
      disconnectEcho();
      
      setStatus("Connecting...", "amber");
      
      // Create new Echo instance
      const echo = createEchoInstance({
        userId,
        accessToken: token,
        apiOrigin,
      });

      // Bind connection events
      if (echo.connector?.pusher?.connection) {
        echo.connector.pusher.connection.bind("connected", () => {
          setStatus("Socket connected", "emerald");
          appendRealtime("Socket connected", { timestamp: new Date().toISOString() });
        });

        echo.connector.pusher.connection.bind("error", (error: any) => {
          setStatus("Socket error", "rose");
          appendRealtime("Socket error", error);
        });
      }

      // Subscribe to user channel
      const channelName = `App.Models.User.${userId}`;
      const channel = subscribeToUserChannel(
        userId,
        (notification: RealtimeNotification) => {
          appendRealtime("Notification received", notification);
        },
        () => {
          setStatus("Channel subscribed", "emerald");
          appendRealtime("Channel subscribed", { channel: `private-${channelName}` });
        },
        (error) => {
          setStatus("Channel authorization failed", "rose");
          appendRealtime("Channel error", error);
        }
      );

    } catch (error: any) {
      setStatus("Connection failed", "rose");
      appendRealtime("Connection error", { 
        message: error.message,
        stack: error.stack 
      });
    }
  };

  const handleDisconnect = () => {
    disconnectEcho();
    setStatus("Disconnected", "slate");
    appendRealtime("Disconnected", { timestamp: new Date().toISOString() });
  };

  const handleClearEvents = () => {
    setRealtimeEvents([]);
  };

  const handleReadAll = async () => {
    try {
      await refresh();
      appendRealtime("Marked all as read", { timestamp: new Date().toISOString() });
    } catch (error: any) {
      appendRealtime("Error marking all as read", { message: error.message });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-7xl">
        <h1 className="mb-8 text-3xl font-bold">Real-Time Notifications Test</h1>

        {/* Configuration Section */}
        <div className="mb-8 rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-xl font-semibold">Configuration</h2>
          
          <div className="grid gap-4 md:grid-cols-2">
            {/* Portal Selection */}
            <div>
              <label className="mb-2 block text-sm font-medium">Portal</label>
              <select
                value={portal}
                onChange={(e) => setPortal(e.target.value as Portal)}
                className="w-full rounded border border-gray-300 px-3 py-2"
              >
                <option value="admin">Admin</option>
                <option value="company">Company</option>
              </select>
            </div>

            {/* User ID */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                User ID (current: {sessionUserId || "loading..."})
              </label>
              <input
                type="text"
                value={manualUserId}
                onChange={(e) => setManualUserId(e.target.value)}
                placeholder={sessionUserId?.toString() || "Enter user ID"}
                className="w-full rounded border border-gray-300 px-3 py-2"
              />
            </div>

            {/* Bearer Token */}
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium">
                Bearer Token (auto-detected: {accessToken ? "✓" : "✗"})
              </label>
              <input
                type="text"
                value={manualToken}
                onChange={(e) => setManualToken(e.target.value)}
                placeholder="Leave empty to use auto-detected token"
                className="w-full rounded border border-gray-300 px-3 py-2"
              />
            </div>
          </div>

          {/* Reverb Settings */}
          <div className="mt-6">
            <h3 className="mb-3 text-lg font-medium">Reverb Settings</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium">App Key</label>
                <input
                  type="text"
                  value={reverbConfig.key}
                  readOnly
                  className="w-full rounded border border-gray-300 bg-gray-100 px-3 py-2"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Host</label>
                <input
                  type="text"
                  value={reverbConfig.host}
                  readOnly
                  className="w-full rounded border border-gray-300 bg-gray-100 px-3 py-2"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Port</label>
                <input
                  type="text"
                  value={reverbConfig.port}
                  readOnly
                  className="w-full rounded border border-gray-300 bg-gray-100 px-3 py-2"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Scheme</label>
                <input
                  type="text"
                  value={reverbConfig.scheme}
                  readOnly
                  className="w-full rounded border border-gray-300 bg-gray-100 px-3 py-2"
                />
              </div>
            </div>
          </div>

          {/* Connection Status */}
          <div className="mt-6">
            <label className="mb-2 block text-sm font-medium">Connection Status</label>
            <div className={`w-fit rounded-full bg-${statusColor}-500/20 px-3 py-1 text-sm text-${statusColor}-300`}>
              {connectionStatus}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={refresh}
              className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              Load API Data
            </button>
            <button
              onClick={handleManualConnect}
              className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700"
            >
              Connect Realtime
            </button>
            <button
              onClick={handleDisconnect}
              className="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
            >
              Disconnect
            </button>
            <button
              onClick={handleReadAll}
              className="rounded bg-purple-600 px-4 py-2 text-white hover:bg-purple-700"
            >
              Mark All Read
            </button>
            <button
              onClick={handleClearEvents}
              className="rounded bg-gray-600 px-4 py-2 text-white hover:bg-gray-700"
            >
              Clear Events
            </button>
          </div>
        </div>

        {/* Two Column Layout for Results */}
        <div className="grid gap-8 md:grid-cols-2">
          {/* API Notifications */}
          <div className="rounded-lg bg-white p-6 shadow">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold">API Notifications</h2>
              <span className="text-sm text-gray-600">Unread: {unreadCount}</span>
            </div>
            <pre className="max-h-[600px] overflow-auto rounded bg-gray-100 p-4 text-xs">
              {notifications.length > 0
                ? JSON.stringify(notifications, null, 2)
                : "Click 'Load API Data' to fetch notifications"}
            </pre>
          </div>

          {/* Realtime Events */}
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-xl font-semibold">Realtime Events</h2>
            <pre className="max-h-[600px] overflow-auto rounded bg-gray-100 p-4 text-xs">
              {realtimeEvents.length > 0
                ? realtimeEvents
                    .map(
                      (event) =>
                        `${event.label}\n${JSON.stringify(event.payload, null, 2)}`,
                    )
                    .join("\n\n")
                : "Waiting for events. Click 'Connect Realtime' to start."}
            </pre>
          </div>
        </div>

        {/* Current Profile Info */}
        {profile && (
          <div className="mt-8 rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-xl font-semibold">Current Profile</h2>
            <pre className="overflow-auto rounded bg-gray-100 p-4 text-xs">
              {JSON.stringify(profile, null, 2)}
            </pre>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-8 rounded-lg bg-blue-50 p-6">
          <h2 className="mb-3 text-xl font-semibold">Testing Instructions</h2>
          <ol className="list-inside list-decimal space-y-2 text-sm">
            <li>Ensure you are logged in as an Admin or Company user</li>
            <li>Click "Load API Data" to fetch existing notifications via REST API</li>
            <li>Click "Connect Realtime" to establish WebSocket connection</li>
            <li>Watch the "Realtime Events" panel for connection status</li>
            <li>Trigger a notification from the backend (Laravel)</li>
            <li>Observe the notification appear in real-time</li>
            <li>Use "Mark All Read" to test the mark-as-read functionality</li>
          </ol>
          
          <div className="mt-4 border-t pt-4">
            <h3 className="mb-2 font-semibold">Expected Flow:</h3>
            <ul className="list-inside list-disc space-y-1 text-sm text-gray-700">
              <li>Socket connected → Channel subscribed → Ready to receive</li>
              <li>Backend sends notification → Echo receives → Event logged</li>
              <li>Notification appears in both panels (API + Realtime)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
