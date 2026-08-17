import type { Locale } from "@/i18n/locale";
import { AboutSection } from "@/modules/home/components/about-section";
import { Footer } from "@/modules/home/components/footer";
import { HeroSection } from "@/modules/home/components/hero-section";
import { HowItWorksSection } from "@/modules/home/components/how-it-works-section";
import { LandingPageShell } from "@/modules/home/components/landing-page-shell";
import { PublicNavbar } from "@/modules/home/components/public-navbar";
import { ScrollReveal } from "@/modules/home/components/scroll-reveal";
import { StatisticsSection } from "@/modules/home/components/statistics-section";
import { WhyUsSection } from "@/modules/home/components/why-us-section";

interface HomePageViewProps {
  locale: Locale;
}

export function HomePageView({ locale }: HomePageViewProps) {
  return (
    <LandingPageShell>
      <PublicNavbar locale={locale} />
      <ScrollReveal>
        <HeroSection locale={locale} />
      </ScrollReveal>
      <ScrollReveal>
        <AboutSection locale={locale} />
      </ScrollReveal>
      <ScrollReveal variant="scale">
        <WhyUsSection locale={locale} />
      </ScrollReveal>
      <ScrollReveal delay={60}>
        <StatisticsSection locale={locale} />
      </ScrollReveal>
      <ScrollReveal variant={locale === "ar" ? "right" : "left"}>
        <HowItWorksSection locale={locale} />
      </ScrollReveal>
      <ScrollReveal>
        <Footer locale={locale} />
      </ScrollReveal>
    </LandingPageShell>
  );
}
