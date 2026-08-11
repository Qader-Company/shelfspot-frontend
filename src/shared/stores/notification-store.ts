"use client";

import { create } from "zustand";
import type {
  PersistedNotification,
  RealtimeNotification,
} from "@/shared/types/notification";
import type { Portal } from "@/shared/services/notifications-api";

interface NotificationStore {
  // State
  notifications: PersistedNotification[];
  unreadCount: number;
  isRealtimeConnected: boolean;
  currentPage: number;
  totalPages: number;
  total: number;
  isLoading: boolean;
  portal: Portal | null;

  // Actions
  setNotifications: (notifications: PersistedNotification[]) => void;
  addNotification: (notification: PersistedNotification) => void;
  upsertRealtimeNotification: (notification: RealtimeNotification) => void;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  setUnreadCount: (count: number) => void;
  incrementUnreadCount: () => void;
  decrementUnreadCount: () => void;
  setRealtimeConnected: (connected: boolean) => void;
  setPagination: (currentPage: number, totalPages: number, total: number) => void;
  setLoading: (loading: boolean) => void;
  setPortal: (portal: Portal) => void;
  reset: () => void;
}

/**
 * Converts a realtime notification to persisted notification format
 */
function realtimeToPersistedNotification(
  realtime: RealtimeNotification,
): PersistedNotification {
  const { id, type, ...data } = realtime;
  
  return {
    id,
    type,
    data: data as any,
    read_at: null,
    created_at: new Date().toISOString(),
  };
}

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  // Initial state
  notifications: [],
  unreadCount: 0,
  isRealtimeConnected: false,
  currentPage: 1,
  totalPages: 1,
  total: 0,
  isLoading: false,
  portal: null,

  // Actions
  setNotifications: (notifications) => set({ notifications }),

  addNotification: (notification) =>
    set((state) => ({
      notifications: [notification, ...state.notifications],
    })),

  upsertRealtimeNotification: (notification) => {
    console.log("🔔 Store: Received realtime notification", notification);
    const persisted = realtimeToPersistedNotification(notification);
    console.log("📦 Store: Converted to persisted format", persisted);
    
    set((state) => {
      const existingIndex = state.notifications.findIndex(
        (n) => n.id === persisted.id,
      );

      if (existingIndex >= 0) {
        console.log("🔄 Store: Updating existing notification at index", existingIndex);
        // Update existing notification
        const updated = [...state.notifications];
        updated[existingIndex] = persisted;
        return { notifications: updated };
      } else {
        console.log("✨ Store: Adding new notification. Current count:", state.notifications.length);
        // Add new notification at the beginning
        const newState = {
          notifications: [persisted, ...state.notifications],
          unreadCount: state.unreadCount + 1,
        };
        console.log("📊 Store: New state", { 
          notificationCount: newState.notifications.length, 
          unreadCount: newState.unreadCount 
        });
        return newState;
      }
    });
  },

  markAsRead: (notificationId) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === notificationId
          ? { ...n, read_at: new Date().toISOString() }
          : n,
      ),
      unreadCount: Math.max(0, state.unreadCount - 1),
    })),

  markAllAsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({
        ...n,
        read_at: new Date().toISOString(),
      })),
      unreadCount: 0,
    })),

  setUnreadCount: (count) => set({ unreadCount: count }),

  incrementUnreadCount: () =>
    set((state) => ({ unreadCount: state.unreadCount + 1 })),

  decrementUnreadCount: () =>
    set((state) => ({ unreadCount: Math.max(0, state.unreadCount - 1) })),

  setRealtimeConnected: (connected) => set({ isRealtimeConnected: connected }),

  setPagination: (currentPage, totalPages, total) =>
    set({ currentPage, totalPages, total }),

  setLoading: (loading) => set({ isLoading: loading }),

  setPortal: (portal) => set({ portal }),

  reset: () =>
    set({
      notifications: [],
      unreadCount: 0,
      isRealtimeConnected: false,
      currentPage: 1,
      totalPages: 1,
      total: 0,
      isLoading: false,
      portal: null,
    }),
}));
