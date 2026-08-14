import { getTranslations } from "next-intl/server";

import MarketplaceExplorer from "./_components/marketplace-explorer";
import type { Metadata } from "next";
import { JsonLd } from "@/shared/_components/json-ld";
import { absoluteUrl, isAppLocale, publicMetadata, SITE_NAME } from "@/shared/lib/seo";
import { createAdminClient } from "@/shared/lib/supabase/admin";
import { getMarketplaceSystems } from "@/shared/lib/supabase/services/systems/get-marketplace-systems.service";

export async function generateMetadata({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> }): Promise<Metadata> {
    const { locale } = await params;
    if (!isAppLocale(locale)) return {};
    const t = await getTranslations({ locale, namespace: "seo.marketplace" });
    const metadata = publicMetadata({ locale, path: "/marketplace", title: t("title"), description: t("description") });
    if (Object.keys(await searchParams).length) metadata.robots = { index: false, follow: false };
    return metadata;
}

export default async function MarketplacePage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale: rawLocale } = await params;
    const locale = isAppLocale(rawLocale) ? rawLocale : "en";
    const t = await getTranslations("marketplace");
    let systems: Awaited<ReturnType<typeof getMarketplaceSystems>> = [];
    try { systems = await getMarketplaceSystems(createAdminClient()); } catch { /* UI performs its own resilient fetch. */ }
    return (
        <>
        <JsonLd data={systems.map((system) => ({
            "@context": "https://schema.org", "@type": ["Product", "SoftwareSourceCode"],
            name: system.name, description: system.description, image: system.image_url || undefined,
            url: absoluteUrl(locale, `/marketplace/systems/${system.id}`), publisher: { "@type": "Organization", name: SITE_NAME },
        }))} />
        <MarketplaceExplorer
            labels={{
                error: t("error"),
                loading: t("loading"),
                heroTitleLineOne: t("hero.titleLineOne"),
                heroTitleLineTwo: t("hero.titleLineTwo"),
                heroDescription: t("hero.description"),
                searchPlaceholder: t("search.placeholder"),
                searchButton: t("search.button"),
                contentEyebrow: t("content.eyebrow"),
                contentTitle: t("content.title"),
                categories: {
                    all: t("categories.all"),
                    popular: t("categories.popular"),
                    developerTools: t("categories.developerTools"),
                    security: t("categories.security"),
                    ecommerce: t("categories.ecommerce"),
                    monitoring: t("categories.monitoring"),
                },
                emptyTitle: t("empty.title"),
                emptyDescription: t("empty.description"),
                cardBadge: t("card.badge"),
                cardViewDetails: t("card.viewDetails"),
                cardImageAlt: t("card.imageAlt"),
                cardImageFallback: t("card.imageFallback"),
            }}
        />
        </>
    );
}
