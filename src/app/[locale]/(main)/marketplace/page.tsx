import { getTranslations } from "next-intl/server";

import MarketplaceExplorer, {
    type MarketplaceSystem,
} from "./_components/marketplace-explorer";
import { createSupabaseServerClient } from "@/shared/lib/supabase/server";

export default async function MarketplacePage() {
    const t = await getTranslations("marketplace");
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
        .from("systems")
        .select("id, name, description, category, tags, icon_url")
        .eq("is_public", true)
        .eq("status", "ACTIVE")
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Failed to load marketplace systems:", error);

        return (
            <main className="grid min-h-[60svh] place-items-center px-4 text-center">
                <p role="alert" className="max-w-md break-words text-destructive">
                    {t("error")}
                </p>
            </main>
        );
    }

    const systems: MarketplaceSystem[] = (data ?? []).map((system) => ({
        ...system,
        tags: system.tags ?? [],
        localizedDescription: t("card.description", { name: system.name }),
    }));

    return (
        <MarketplaceExplorer
            systems={systems}
            labels={{
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
