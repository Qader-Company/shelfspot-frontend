import type { Locale } from "@/i18n/locale";
import { AboutSection } from "@/modules/home/components/about-section";
import { HeroSection } from "@/modules/home/components/hero-section";
import { LandingPageShell } from "@/modules/home/components/landing-page-shell";
import { PublicNavbar } from "@/modules/home/components/public-navbar";

interface HomePageViewProps {
  locale: Locale;
}

export function HomePageView({ locale }: HomePageViewProps) {
  return (
    <LandingPageShell>
      <PublicNavbar locale={locale} />
      <HeroSection locale={locale} />
      <AboutSection locale={locale} />
    </LandingPageShell>
  );
}
