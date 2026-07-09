import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";

import { DashboardEmptyIllustration } from "@/modules/dashboard/components/dashboard-empty-illustration";
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
        icon={<DashboardEmptyIllustration />}
        action={
          <Button className="h-12 rounded-lg px-6 text-sm font-semibold" type="button">
            <Plus className="size-5" />
            {t("empty.action")}
          </Button>
        }
      />
    </div>
  );
}
