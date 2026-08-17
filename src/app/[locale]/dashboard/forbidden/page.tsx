import { ArrowLeft, LockKeyhole, ShieldX } from "lucide-react";

import { ROUTES } from "@/config/routes";
import type { Locale } from "@/i18n/locale";
import { Link } from "@/i18n/navigation";
import { Button } from "@/shared/ui/button";

export default async function ForbiddenPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const isArabic = locale === "ar";

  return (
    <div className="relative flex min-h-[calc(100dvh-6rem)] items-center justify-center overflow-hidden px-4 py-12">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,var(--color-primary)/0.12,transparent_38%),radial-gradient(circle_at_bottom_right,var(--color-primary)/0.08,transparent_34%)]" />
      <div className="relative w-full max-w-xl rounded-[2rem] border border-border/70 bg-card/95 p-8 text-center shadow-[0_28px_90px_-42px_rgba(0,0,0,0.35)] backdrop-blur sm:p-12">
        <div className="relative mx-auto mb-7 flex size-24 items-center justify-center rounded-full bg-primary/10 text-primary">
          <span className="absolute inset-2 animate-pulse rounded-full border border-primary/20" />
          <ShieldX className="size-12" strokeWidth={1.7} />
          <span className="absolute -bottom-1 -end-1 flex size-9 items-center justify-center rounded-full border-4 border-card bg-foreground text-background">
            <LockKeyhole className="size-4" />
          </span>
        </div>

        <p className="mb-3 text-sm font-bold uppercase tracking-[0.22em] text-primary">403</p>
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          {isArabic ? "غير مسموح لك بالدخول" : "You don’t have access"}
        </h1>
        <p className="mx-auto mt-4 max-w-md leading-7 text-muted-foreground">
          {isArabic
            ? "هذا القسم غير متاح لصلاحيات حسابك الحالية. تواصل مع مالك الشركة إذا كنت تحتاج إلى الوصول إليه."
            : "This area isn’t included in your current account permissions. Contact your company owner if you need access."}
        </p>

        <Button asChild className="mt-8 h-12 rounded-xl px-6 text-white">
          <Link href={ROUTES.dashboard}>
            <ArrowLeft className="size-4 rtl:rotate-180" />
            {isArabic ? "العودة إلى لوحة التحكم" : "Back to dashboard"}
          </Link>
        </Button>
      </div>
    </div>
  );
}
