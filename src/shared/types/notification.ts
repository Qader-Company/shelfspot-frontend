// Task notification events
export type TaskNotificationEvent =
  | "task.published"
  | "task.reassigned"
  | "task.reopened"
  | "task.completed"
  | "task.failed"
  | "task.worker_cancelled"
  | "task.rejected";

// Payment notification events
export type PaymentNotificationEvent =
  | "payment.completed"
  | "payment.pending"
  | "payment.failed"
  | "payment.refunded";

// General notification events
export type GeneralNotificationEvent =
  | "system.maintenance"
  | "system.update"
  | "account.verified"
  | "account.suspended";

// All notification events
export type NotificationEvent =
  | TaskNotificationEvent
  | PaymentNotificationEvent
  | GeneralNotificationEvent;

// Notification categories
export type NotificationCategory = "task" | "payment" | "system" | "account";

export interface NotificationAction {
  resource: string;
  id?: number | string;
  url?: string;
  href?: string;
  path?: string;
}

export interface GenericNotificationPayload {
  event: string;
  category?: string;
  priority?: "normal" | "high";
  title?: string;
  message?: string;
  description?: string;
  body?: string;
  task_id?: number | string;
  payment_id?: number | string;
  amount?: number;
  currency?: string;
  action?: NotificationAction | string;
  meta?: Record<string, unknown>;
  occurred_at?: string;
  [key: string]: unknown;
}

// Task notification payload (from API)
export interface TaskNotificationPayload {
  event: TaskNotificationEvent;
  category: "task";
  priority: "normal" | "high";
  task_id: number;
  company_id: number;
  status: string;
  actor_id: number | null;
  action: {
    resource: "task";
    id: number;
  };
  meta: {
    status_history_id: number;
    from_status: string;
    to_status: string;
    [key: string]: unknown;
  };
  occurred_at: string; // ISO-8601 timestamp
}

// Payment notification payload
export interface PaymentNotificationPayload {
  event: PaymentNotificationEvent;
  category: "payment";
  priority: "normal" | "high";
  payment_id: number;
  amount: number;
  currency?: string;
  status: string;
  actor_id: number | null;
  action: {
    resource: "payment";
    id: number;
  };
  meta: {
    [key: string]: unknown;
  };
  occurred_at: string;
}

// General notification payload
export interface GeneralNotificationPayload {
  event: GeneralNotificationEvent;
  category: NotificationCategory;
  priority: "normal" | "high";
  title?: string;
  message?: string;
  action?: {
    resource: string;
    id?: number;
  };
  meta: {
    [key: string]: unknown;
  };
  occurred_at: string;
}

// Union type for all notification payloads
export type NotificationPayload =
  | TaskNotificationPayload
  | PaymentNotificationPayload
  | GeneralNotificationPayload
  | GenericNotificationPayload;

// Persisted notification from REST API
export interface PersistedNotification {
  id: string;
  type: "App\\Notifications\\RealtimeNotification" | string;
  data: NotificationPayload;
  read_at: string | null;
  created_at: string | null;
}

// Realtime notification from websocket (payload is at top level + id & type)
export interface RealtimeNotification extends GenericNotificationPayload {
  id: string;
  type: string;
}

// API response wrapper
export interface NotificationResponse {
  success: boolean;
  message?: string;
  data: {
    data: PersistedNotification[];
    links: {
      first: string | null;
      last: string | null;
      prev: string | null;
      next: string | null;
    };
    meta: {
      current_page: number;
      from: number | null;
      last_page: number;
      per_page: number;
      to: number | null;
      total: number;
    };
  };
}

export interface UnreadCountResponse {
  success: boolean;
  data: {
    unread_count: number;
  };
}

export interface MarkReadResponse {
  success: boolean;
  message?: string;
  data: PersistedNotification;
}

export interface MarkAllReadResponse {
  success: boolean;
  message?: string;
  data: {
    unread_count: number;
  };
}
