import type { Locale } from "@/i18n/locale";
import { AboutSection } from "@/modules/home/components/about-section";
import { Footer } from "@/modules/home/components/footer";
import { HeroSection } from "@/modules/home/components/hero-section";
import { HowItWorksSection } from "@/modules/home/components/how-it-works-section";
import { LandingPageShell } from "@/modules/home/components/landing-page-shell";
import { PublicNavbar } from "@/modules/home/components/public-navbar";
import { StatisticsSection } from "@/modules/home/components/statistics-section";
import { WhyUsSection } from "@/modules/home/components/why-us-section";

interface HomePageViewProps {
  locale: Locale;
}

export function HomePageView({ locale }: HomePageViewProps) {
  return (
    <LandingPageShell>
      <PublicNavbar locale={locale} />
      <HeroSection locale={locale} />
      <AboutSection locale={locale} />
      <WhyUsSection locale={locale} />
      <StatisticsSection locale={locale} />
      <HowItWorksSection locale={locale} />
      <Footer locale={locale} />
    </LandingPageShell>
  );
}
