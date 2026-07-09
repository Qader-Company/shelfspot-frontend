import Image from "next/image";
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";

import { EmptyState } from "@/shared/components/feedback";
import { Button } from "@/shared/ui/button";

export function DashboardHomePageView() {
  const t = useTranslations("dashboard.home");

  return (
    <div className="flex min-h-[calc(100dvh-4rem)] items-center justify-center px-6 py-12">
      <EmptyState
        variant="plain"
        className="max-w-sm"
        title={t("empty.title")}
        icon={
          <Image
            src="/company/dash-home-emptystatus.png"
            alt=""
            width={200}
            height={200}
            className="h-36 w-36 object-contain"
            priority
          />
        }
        action={
          <Button
            className="h-12 rounded-lg px-6 text-sm font-semibold text-white hover:text-white"
            type="button"
          >
            <Plus className="size-5" />
            {t("empty.action")}
          </Button>
        }
      />
    </div>
  );
}
