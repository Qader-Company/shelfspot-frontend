"use client";

import { useState } from "react";
import type { ComponentType } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  BellRing,
  CircleCheck,
  CircleX,
  RotateCcw,
} from "lucide-react";

import { useNotificationStore } from "@/shared/stores/notification-store";
import {
  formatNotification,
  getNotificationTone,
  formatRelativeTime,
} from "@/shared/lib/notifications/format-notification";
import { NotificationIcon } from "@/shared/components/dashboard/dashboard-icons";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";
import type { Portal } from "@/shared/services/notifications-api";

interface NotificationButtonProps {
  label: string;
  onMarkAsRead?: (notificationId: string) => void;
  onMarkAllAsRead?: () => void;
  portal?: Portal;
}

const toneClasses = {
  info: {
    icon: "text-primary",
    unread: "bg-primary",
    iconComponent: BellRing,
  },
  danger: {
    icon: "text-destructive",
    unread: "bg-destructive",
    iconComponent: CircleX,
  },
  success: {
    icon: "text-green-600",
    unread: "bg-green-600",
    iconComponent: CircleCheck,
  },
  warning: {
    icon: "text-yellow-600",
    unread: "bg-yellow-600",
    iconComponent: RotateCcw,
  },
} satisfies Record<
  "info" | "danger" | "success" | "warning",
  {
    icon: string;
    unread: string;
    iconComponent: ComponentType<{ className?: string }>;
  }
>;

export function NotificationButton({
  label,
  onMarkAsRead,
  onMarkAllAsRead,
  portal = "company",
}: NotificationButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const t = useTranslations("dashboard.notifications");
  const locale = useLocale();

  const { notifications, unreadCount } = useNotificationStore();

  // Debug logging
  console.log("🎨 NotificationButton render:", {
    notificationCount: notifications.length,
    unreadCount,
    isOpen,
  });

  const handleNotificationClick = (notificationId: string) => {
    if (onMarkAsRead) {
      onMarkAsRead(notificationId);
    }
    setIsOpen(false);
  };

  const handleMarkAllAsRead = () => {
    if (onMarkAllAsRead) {
      onMarkAllAsRead();
    }
  };

  return (
    <div className="relative">
      {isOpen ? (
        <button
          aria-label={t("closeOverlay")}
          className="fixed inset-0 z-20 cursor-default bg-foreground/20"
          type="button"
          onClick={() => setIsOpen(false)}
        />
      ) : null}
      <Button
        aria-label={label}
        aria-expanded={isOpen}
        className="relative z-30 size-10 rounded-full text-foreground hover:bg-muted"
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen((current) => !current)}
      >
        <NotificationIcon className="size-5 stroke-[1.8]" />
        {unreadCount > 0 && (
          <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-xs font-semibold text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </Button>
      {isOpen ? (
        <section className="absolute end-0 top-14 z-30 w-[min(30rem,calc(100vw-2rem))] overflow-hidden rounded-xl bg-card shadow-2xl shadow-foreground/15 ring-1 ring-border">
          <div className="flex items-center justify-between gap-4 px-7 py-6">
            <h2 className="text-2xl font-semibold text-foreground">
              {t("title")}
            </h2>
            {unreadCount > 0 && (
              <div className="flex items-center gap-3">
                <span className="rounded-full bg-destructive/20 px-3 py-1 text-sm font-medium text-destructive">
                  {unreadCount} {t("newBadge")}
                </span>
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-sm font-medium text-primary hover:underline"
                  type="button"
                >
                  {t("markAllRead")}
                </button>
              </div>
            )}
          </div>
          <div className="max-h-[32rem] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-7 py-8 text-center text-muted-foreground">
                {t("noNotifications")}
              </div>
            ) : (
              notifications.map((notification) => {
                const formatted = formatNotification(notification, portal);
                const tone = getNotificationTone(formatted.event);
                const toneClass = toneClasses[tone];
                const Icon = toneClass.iconComponent;
                const titleKey = formatted.titleKey as Parameters<typeof t>[0];
                const descriptionKey = formatted.descriptionKey as Parameters<typeof t>[0];
                const translationValues = {
                  taskId: formatted.taskId ?? "",
                  paymentId: formatted.paymentId ?? "",
                  amount: formatted.amount ?? "",
                  currency: formatted.currency ?? "",
                };
                const title = formatted.customTitle ||
                  (t.has(titleKey) ? t(titleKey) : t("fallback.title"));
                const description = formatted.customMessage ||
                  (t.has(descriptionKey)
                    ? t(descriptionKey, translationValues)
                    : t("fallback.description"));

                return (
                  <Link
                    key={formatted.id}
                    href={formatted.actionUrl}
                    className={cn(
                      "grid cursor-pointer grid-cols-[2rem_1fr_auto] gap-4 border-t border-border px-7 py-4 transition-colors hover:bg-muted/50",
                      !formatted.read && "bg-primary/5",
                    )}
                    onClick={() => handleNotificationClick(formatted.id)}
                  >
                    <Icon className={cn("mt-1 size-6 stroke-[2.4]", toneClass.icon)} />
                    <div className="min-w-0">
                      <h3 className="text-lg font-medium leading-6 text-foreground">
                        {title}
                      </h3>
                      <p className="mt-1 text-lg leading-6 text-muted-foreground">
                        {description}
                      </p>
                      <p className="mt-1 text-sm leading-6 text-muted-foreground">
                        {formatRelativeTime(formatted.createdAt, locale)}
                      </p>
                    </div>
                    {!formatted.read && (
                      <span
                        className={cn(
                          "mt-8 size-2.5 rounded-full",
                          toneClass.unread,
                        )}
                      />
                    )}
                  </Link>
                );
              })
            )}
          </div>
        </section>
      ) : null}
    </div>
  );
}
