import { HatchedContainer } from "@/shared/_components/hatched-container";
import Sponsors from "./_components/sponsors";
import EcosystemSuite from "./_components/ecosystem-suite";
import VisionBanner from "./_components/vision-banner";
import FAQ from "./_components/faq";
import Footer from "../../(main)/_components/footer/Footer";
import Hero from "../../(main)/_components/hero";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { JsonLd } from "@/shared/_components/json-ld";
import { absoluteUrl, isAppLocale, publicMetadata, SITE_NAME, SITE_URL } from "@/shared/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isAppLocale(locale)) return {};
  const t = await getTranslations({ locale, namespace: "seo.home" });
  return publicMetadata({ locale, title: t("title"), description: t("description") });
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  const locale = isAppLocale(rawLocale) ? rawLocale : "en";
  const t = await getTranslations({ locale, namespace: "seo.home" });
  return (
    <main className="min-h-screen ">
      <JsonLd data={[
        { "@context": "https://schema.org", "@type": "Organization", name: SITE_NAME, url: SITE_URL, logo: `${SITE_URL}/icon.svg` },
        { "@context": "https://schema.org", "@type": "WebSite", name: SITE_NAME, url: absoluteUrl(locale), inLanguage: locale },
        { "@context": "https://schema.org", "@type": "SoftwareApplication", name: SITE_NAME, applicationCategory: "BusinessApplication", operatingSystem: "Web", description: t("description"), url: absoluteUrl(locale), offers: { "@type": "Offer", price: "0", priceCurrency: "EGP" } },
      ]} />
      <Hero />
      <section className="w-full flex justify-center">
        <HatchedContainer
          direction="diagonal"
          sides="x"
          className="max-w-6xl w-full"
        >
          <div className="bg-white min-h-screen">
            <Sponsors />
            <EcosystemSuite />
          </div>
        </HatchedContainer>
      </section>
      <VisionBanner />
      <div className="bg-[#f4f3f1]">
        <FAQ />
        <Footer />
      </div>
    </main>
  );
}
