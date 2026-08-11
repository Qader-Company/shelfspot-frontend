"use client";

import Echo from "laravel-echo";
import Pusher from "pusher-js";

// Make Pusher available globally for Laravel Echo
if (typeof window !== "undefined") {
  window.Pusher = Pusher;
}

let echoInstance: Echo | null = null;

export interface EchoConfig {
  userId: number;
}

/**
 * Creates and configures a Laravel Echo instance for Reverb WebSocket connection
 */
export function createEchoInstance(config: EchoConfig): Echo {
  // Disconnect existing instance if any
  if (echoInstance) {
    echoInstance.disconnect();
  }

  const reverbAppKey = process.env.NEXT_PUBLIC_REVERB_APP_KEY;
  const reverbHost = process.env.NEXT_PUBLIC_REVERB_HOST;
  const reverbPort = process.env.NEXT_PUBLIC_REVERB_PORT;
  const reverbScheme = process.env.NEXT_PUBLIC_REVERB_SCHEME || "https";

  if (!reverbAppKey || !reverbHost || !reverbPort) {
    throw new Error(
      "Missing Reverb configuration. Ensure NEXT_PUBLIC_REVERB_APP_KEY, NEXT_PUBLIC_REVERB_HOST, and NEXT_PUBLIC_REVERB_PORT are set.",
    );
  }

  echoInstance = new Echo({
    broadcaster: "reverb",
    key: reverbAppKey,
    wsHost: reverbHost,
    wsPort: Number(reverbPort),
    wssPort: Number(reverbPort),
    forceTLS: reverbScheme === "https",
    enabledTransports: ["ws", "wss"],
    authEndpoint: "/api/broadcasting/auth", // Use local proxy to avoid CORS
    auth: {
      headers: {
        Accept: "application/json",
        "X-CSRF-TOKEN": "", // Not needed for our setup
      },
    },
  });

  return echoInstance;
}

/**
 * Returns the current Echo instance
 */
export function getEchoInstance(): Echo | null {
  return echoInstance;
}

/**
 * Disconnects and clears the Echo instance
 */
export function disconnectEcho(): void {
  if (echoInstance) {
    echoInstance.disconnect();
    echoInstance = null;
  }
}

/**
 * Subscribes to the user's private notification channel
 */
export function subscribeToUserChannel(
  userId: number,
  onNotification: (notification: any) => void,
  onSubscribed?: () => void,
  onError?: (error: any) => void,
) {
  if (!echoInstance) {
    throw new Error("Echo instance not initialized. Call createEchoInstance first.");
  }

  const channelName = `App.Models.User.${userId}`;
  const channel = echoInstance.private(channelName);

  if (onSubscribed) {
    channel.subscribed(() => {
      console.log(`✅ Subscribed to ${channelName}`);
      onSubscribed();
    });
  }

  channel.notification((notification: any) => {
    console.log("🔵 Echo: Raw notification received from channel:", notification);
    console.log("🔵 Echo: Notification keys:", Object.keys(notification));
    console.log("🔵 Echo: Notification structure:", JSON.stringify(notification, null, 2));
    onNotification(notification);
  });

  if (onError) {
    channel.error((error: any) => {
      console.error(`❌ Channel error for ${channelName}:`, error);
      onError(error);
    });
  }

  return channel;
}
