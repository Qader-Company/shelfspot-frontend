import type { Locale } from "@/i18n/locale";
import { cn } from "@/shared/lib/utils";

import { FooterBottom } from "@/modules/home/components/footer-bottom";
import { FooterContact } from "@/modules/home/components/footer-contact";
import { FooterLogo } from "@/modules/home/components/footer-logo";
import { FooterNavigation } from "@/modules/home/components/footer-navigation";
import { LandingContainer } from "@/modules/home/components/landing-container";

interface FooterProps {
  locale: Locale;
}

export async function Footer({
  locale,
}: FooterProps) {
  const isRtl = locale === "ar";

  return (
    <footer id="contact" className="pt-16 sm:pt-20 lg:pt-24">
      <LandingContainer>
        <div
          className={cn(
            "grid gap-10 pb-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-12",
            isRtl ? "lg:[direction:rtl]" : "lg:[direction:ltr]",
          )}
        >
          <FooterLogo locale={locale} />
          <FooterNavigation locale={locale} />
          <FooterContact locale={locale} />
        </div>
      </LandingContainer>

      <FooterBottom />
    </footer>
  );
}
