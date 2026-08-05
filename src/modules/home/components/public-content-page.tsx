import { ArrowLeft, ArrowRight, Mail, MapPin, Phone } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { ROUTES } from "@/config/routes";
import type { Locale } from "@/i18n/locale";
import { Link } from "@/i18n/navigation";
import { Footer } from "@/modules/home/components/footer";
import { FaqAccordion } from "@/modules/home/components/faq-accordion";
import { LandingContainer } from "@/modules/home/components/landing-container";
import { LandingPageShell } from "@/modules/home/components/landing-page-shell";
import { PublicNavbar } from "@/modules/home/components/public-navbar";
import { ScrollReveal } from "@/modules/home/components/scroll-reveal";
import { getPublicPlatformSettings } from "@/modules/home/services/platform-settings";

type ContentPage = "privacy" | "terms" | "faqs" | "contact";

interface PublicContentPageProps {
  locale: Locale;
  page: ContentPage;
}

const sectionKeys = {
  privacy: ["collection", "usage", "sharing", "security", "rights", "retention"],
  terms: ["acceptance", "accounts", "services", "payments", "conduct", "liability"],
} as const;

const faqKeys = ["platform", "companies", "tasks", "verification", "payments", "support"] as const;

export async function PublicContentPage({ locale, page }: PublicContentPageProps) {
  const t = await getTranslations("publicPages");
  const isRtl = locale === "ar";
  const BackIcon = isRtl ? ArrowRight : ArrowLeft;
  const settings = page === "contact" ? await getPublicPlatformSettings() : null;

  return (
    <LandingPageShell>
      <PublicNavbar locale={locale} />
      <section className="relative overflow-hidden border-b border-border/60 bg-card py-14 sm:py-20">
        <div className="pointer-events-none absolute -top-24 end-[-8rem] size-80 rounded-full bg-primary/10 blur-3xl" />
        <LandingContainer className="relative public-page-hero-in">
          <Link href={ROUTES.home} className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80">
            <BackIcon className="size-4" />
            {t("backHome")}
          </Link>
          <p className="mb-3 text-sm font-semibold tracking-wide text-primary sm:text-base">{t(`${page}.eyebrow`)}</p>
          <h1 className="max-w-3xl text-3xl leading-tight font-bold sm:text-5xl">{t(`${page}.title`)}</h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-foreground/70 sm:text-lg">{t(`${page}.intro`)}</p>
          {page === "privacy" || page === "terms" ? (
            <p className="mt-5 text-sm text-foreground/55">{t("lastUpdated")}</p>
          ) : null}
        </LandingContainer>
      </section>

      <LandingContainer className="py-12 sm:py-16 lg:py-20">
        {page === "privacy" || page === "terms" ? (
          <div className="mx-auto grid max-w-4xl gap-5">
            {sectionKeys[page].map((key, index) => (
              <ScrollReveal
                key={key}
                delay={index * 90}
                variant={index % 2 === 0 ? "left" : "right"}
              >
                <article className="rounded-2xl border border-border/70 bg-background p-6 shadow-sm transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-1 hover:border-primary/25 hover:shadow-md sm:p-8">
                  <div className="flex items-start gap-4">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">{index + 1}</span>
                    <div>
                      <h2 className="text-xl font-semibold sm:text-2xl">{t(`${page}.sections.${key}.title`)}</h2>
                      <p className="mt-3 text-sm leading-7 text-foreground/70 sm:text-base sm:leading-8">{t(`${page}.sections.${key}.body`)}</p>
                    </div>
                  </div>
                </article>
              </ScrollReveal>
            ))}
          </div>
        ) : null}

        {page === "faqs" ? (
          <ScrollReveal>
            <FaqAccordion items={faqKeys.map((key) => ({ question: t(`faqs.items.${key}.question`), answer: t(`faqs.items.${key}.answer`) }))} />
          </ScrollReveal>
        ) : null}

        {page === "contact" ? (
          <div className="mx-auto grid max-w-4xl gap-5 sm:grid-cols-3">
            {[
              { icon: MapPin, label: t("contact.cards.location"), value: settings?.address || t("contact.values.location"), href: undefined },
              { icon: Phone, label: t("contact.cards.phone"), value: settings?.phone || t("contact.values.phone"), href: `tel:${settings?.phone || "+966xxxxxxxxxx"}` },
              { icon: Mail, label: t("contact.cards.email"), value: settings?.email || t("contact.values.email"), href: `mailto:${settings?.email || "info@shelfspot.com"}` },
            ].map(({ icon: Icon, label, value, href }, index) => (
              <ScrollReveal key={label} delay={index * 90}>
                <article className="flex h-full flex-col items-center rounded-2xl border border-border/70 bg-background p-7 text-center shadow-sm transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-1 hover:border-primary/25 hover:shadow-md">
                  <span className="mb-5 flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary"><Icon className="size-6" /></span>
                  <h2 className="text-lg font-semibold">{label}</h2>
                  {href ? <a href={href} dir="ltr" className="mt-3 break-all text-sm leading-6 text-primary hover:underline">{value}</a> : <p className="mt-3 text-sm leading-6 text-foreground/70">{value}</p>}
                </article>
              </ScrollReveal>
            ))}
          </div>
        ) : null}
      </LandingContainer>
      <ScrollReveal>
        <Footer
          locale={locale}
          settings={settings}
          loadSettings={page === "contact"}
        />
      </ScrollReveal>
    </LandingPageShell>
  );
}
