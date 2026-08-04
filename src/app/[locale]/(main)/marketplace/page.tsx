import { getTranslations } from "next-intl/server";

import MarketplaceExplorer from "./_components/marketplace-explorer";

export default async function MarketplacePage() {
    const t = await getTranslations("marketplace");
    return (
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
            }}
        />
    );
}
