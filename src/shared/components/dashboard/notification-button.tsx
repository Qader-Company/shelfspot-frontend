"use client";

import { useState } from "react";
import type { ComponentType } from "react";
import { useTranslations } from "next-intl";

import { dashboardNotifications } from "@/shared/components/dashboard/dashboard-notifications.seed";
import type { NotificationTone } from "@/shared/components/dashboard/dashboard-notifications.seed";
import { NotificationIcon } from "@/shared/components/dashboard/dashboard-icons";
import {
  AssignmentRejectedIcon,
  FreelancerAssignedIcon,
  HiringRequestIcon,
  WalletCreditedIcon,
} from "@/shared/components/dashboard/notification-icons";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";

interface NotificationButtonProps {
  label: string;
}

const toneClasses = {
  info: {
    icon: "text-primary",
    unread: "bg-primary",
    iconComponent: HiringRequestIcon,
  },
  danger: {
    icon: "",
    unread: "bg-primary",
    iconComponent: AssignmentRejectedIcon,
  },
  success: {
    icon: "",
    unread: "bg-primary",
    iconComponent: FreelancerAssignedIcon,
  },
  purple: {
    icon: "",
    unread: "bg-primary",
    iconComponent: WalletCreditedIcon,
  },
} satisfies Record<
  NotificationTone,
  {
    icon: string;
    unread: string;
    iconComponent: ComponentType<{ className?: string }>;
  }
>;

export function NotificationButton({ label }: NotificationButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const t = useTranslations("dashboard.notifications");

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
      </Button>
      {isOpen ? (
        <section className="absolute end-0 top-14 z-30 w-[min(30rem,calc(100vw-2rem))] overflow-hidden rounded-xl bg-card shadow-2xl shadow-foreground/15 ring-1 ring-border">
          <div className="flex items-center justify-between gap-4 px-7 py-6">
            <h2 className="text-2xl font-semibold text-foreground">
              {t("title")}
            </h2>
            <span className="rounded-full bg-destructive/20 px-3 py-1 text-sm font-medium text-destructive">
              {t("newBadge")}
            </span>
          </div>
          <div>
            {dashboardNotifications.map((item) => {
              const tone = toneClasses[item.tone];
              const Icon = tone.iconComponent;

              return (
                <article
                  key={item.id}
                  className="grid grid-cols-[2rem_1fr_auto] gap-4 border-t border-border bg-primary/5 px-7 py-4"
                >
                  <Icon className={cn("mt-1 size-6 stroke-[2.4]", tone.icon)} />
                  <div className="min-w-0">
                    <h3 className="text-lg font-medium leading-6 text-foreground">
                      {t(item.titleKey)}
                    </h3>
                    <p className="mt-1 text-lg leading-6 text-muted-foreground">
                      {t(item.descriptionKey)}
                    </p>
                    <p className="mt-1 text-lg leading-6 text-muted-foreground">
                      {t(item.timeKey)}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "mt-8 size-2.5 rounded-full",
                      tone.unread,
                    )}
                  />
                </article>
              );
            })}
          </div>
        </section>
      ) : null}
    </div>
  );
}
