import type { Locale } from "@/i18n/locale";
import { FooterBottom } from "@/modules/home/components/footer-bottom";
import { FooterContact } from "@/modules/home/components/footer-contact";
import { FooterLogo } from "@/modules/home/components/footer-logo";
import { FooterNavigation } from "@/modules/home/components/footer-navigation";
import { LandingContainer } from "@/modules/home/components/landing-container";
import { getPublicPlatformSettings, type PublicPlatformSettings } from "@/modules/home/services/platform-settings";

interface FooterProps {
  locale: Locale;
  settings?: PublicPlatformSettings | null;
  loadSettings?: boolean;
}

export async function Footer({
  locale,
  settings: providedSettings,
  loadSettings = true,
}: FooterProps) {
  const isRtl = locale === "ar";
  const settings = providedSettings !== undefined
    ? providedSettings
    : loadSettings
      ? await getPublicPlatformSettings()
      : null;

  return (
    <footer id="contact" className="overflow-x-clip pt-12 sm:pt-16 lg:pt-24">
      <LandingContainer>
        <div
          dir={isRtl ? "rtl" : "ltr"}
          className="grid gap-10 pb-8 md:grid-cols-2 md:gap-x-8 md:gap-y-12 md:pb-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-12"
        >
          <FooterLogo
            locale={locale}
            description={settings?.description}
            className="md:max-lg:col-span-2"
          />
          <FooterNavigation locale={locale} />
          <FooterContact locale={locale} settings={settings} />
        </div>
      </LandingContainer>

      <FooterBottom locale={locale} />
    </footer>
  );
}
