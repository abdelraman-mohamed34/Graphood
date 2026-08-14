"use client";

import Image from "next/image";
import { memo, useDeferredValue, useMemo, useState } from "react";
import { ExternalLink, Layers, Search } from "lucide-react";
import { useLocale } from "next-intl";

import { Link } from "@/i18n/navigation";
import { useTags } from "@/shared/lib/hooks/tags/use-tag";
import { useSystems } from "@/shared/lib/hooks/systems/use-systems";
import type { MarketplaceSystem } from "@/shared/lib/supabase/services/systems/get-marketplace-systems.service";

interface MarketplaceLabels {
    heroTitleLineOne: string;
    heroTitleLineTwo: string;
    heroDescription: string;
    searchPlaceholder: string;
    searchButton: string;
    contentEyebrow: string;
    contentTitle: string;
    categories: Record<string, string>;
    emptyTitle: string;
    emptyDescription: string;
    cardBadge: string;
    cardViewDetails: string;
    cardImageAlt: string;
    cardImageFallback: string;
    error: string;
    loading: string;
}

interface MarketplaceExplorerProps {
    labels: MarketplaceLabels;
}

const SystemCard = memo(function SystemCard({
    system,
    labels,
}: {
    system: MarketplaceSystem;
    labels: Pick<MarketplaceLabels, "cardBadge" | "cardViewDetails" | "cardImageAlt" | "cardImageFallback">;
}) {
    return (
        <Link
            href={`/marketplace/systems/${system.id}`}
            className="group min-w-0 rounded-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
            <article className="h-full min-w-0 overflow-hidden rounded-none border border-border bg-card shadow-xs transition-[border-color,box-shadow] duration-200 group-hover:border-primary/50 group-hover:shadow-lg">
                <div className="relative aspect-[16/9] overflow-hidden bg-muted">
                    {system.image_url ? (
                        <Image
                            src={system.image_url}
                            alt={`${system.name} — ${labels.cardImageAlt}`}
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                        />
                    ) : (
                        <span className="absolute inset-0 grid place-items-center border border-white/10 bg-white/40 text-center backdrop-blur-sm text-muted-foreground">
                            <Layers className="mx-auto size-8" aria-hidden="true" />
                        </span>
                    )}
                    <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-3 border-t border-white/15 bg-black/65 p-3 text-white backdrop-blur-sm">
                        <h2 className="min-w-0 break-words text-start text-lg font-bold">
                            {system.name}
                        </h2>
                        <ExternalLink
                            aria-hidden="true"
                            className="size-4 shrink-0 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5"
                        />
                    </div>
                </div>
            </article>
        </Link>
    );
});

export default function MarketplaceExplorer({ labels }: MarketplaceExplorerProps) {
    const locale = useLocale();
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<string>("all");
    const deferredQuery = useDeferredValue(searchQuery);

    const { data: systems = [], isLoading: isLoadingSystems, error: systemsError } = useSystems();
    const { data: tagsList = [] } = useTags();

    const filteredSystems = useMemo(() => {
        const query = deferredQuery.trim().toLocaleLowerCase();
        return systems.filter((system) => {
            const searchableText = [
                system.name,
                system.description,
                ...system.tags.flatMap((tag) => [tag.name_en, tag.name_ar, tag.slug]),
            ]
                .join(" ")
                .toLocaleLowerCase();
            const matchesQuery = !query || searchableText.includes(query);
            const matchesCategory = selectedCategory === "all" ||
                system.tags.some((tag) => tag.id === selectedCategory);

            return matchesQuery && matchesCategory;
        });
    }, [deferredQuery, selectedCategory, systems]);

    const cardLabels = useMemo(
        () => ({
            cardBadge: labels.cardBadge,
            cardViewDetails: labels.cardViewDetails,
            cardImageAlt: labels.cardImageAlt,
            cardImageFallback: labels.cardImageFallback,
        }),
        [labels.cardBadge, labels.cardImageAlt, labels.cardImageFallback, labels.cardViewDetails]
    );

    return (
        <main className="min-h-screen min-w-0 overflow-x-clip bg-background text-foreground">
            <section className="max-h-screen overflow-y-auto border-b border-border bg-[#f4f3f1] py-5 text-foreground sm:py-7 lg:py-8">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-2xl space-y-3 text-center">
                        <h1 className="break-words text-xl font-bold leading-tight tracking-tight text-maroon sm:text-2xl lg:text-3xl">
                            {labels.heroTitleLineOne}{" "}
                            <span className="sm:block">{labels.heroTitleLineTwo}</span>
                        </h1>

                        <p className="mx-auto max-w-xl break-words text-xs leading-relaxed text-neutral-600 sm:text-sm">
                            {labels.heroDescription}
                        </p>

                        <form
                            role="search"
                            className="mx-auto max-w-lg"
                            onSubmit={(event) => event.preventDefault()}
                        >
                            <label htmlFor="marketplace-search" className="sr-only">
                                {labels.searchPlaceholder}
                            </label>
                            <div className="flex min-w-0 items-center rounded-sm border border-neutral-300 bg-white p-1 shadow-sm transition-colors focus-within:border-teal focus-within:ring-2 focus-within:ring-teal/20">
                                <Search aria-hidden="true" className="ms-2 size-5 shrink-0 text-neutral-500 sm:ms-3" />
                                <input
                                    id="marketplace-search"
                                    type="search"
                                    value={searchQuery}
                                    onChange={(event) => setSearchQuery(event.target.value)}
                                    placeholder={labels.searchPlaceholder}
                                    autoComplete="off"
                                    className="min-w-0 flex-1 bg-transparent px-2 py-1.5 text-sm text-neutral-900 outline-none placeholder:text-neutral-400"
                                />
                                <button
                                    type="submit"
                                    className="shrink-0 rounded-sm bg-primary px-3 py-2 text-xs font-medium text-primary-foreground transition-colors hover:bg-teal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal/50 sm:px-5 sm:text-sm"
                                >
                                    <span className="hidden min-[360px]:inline">{labels.searchButton}</span>
                                    <Search aria-hidden="true" className="size-4 min-[360px]:hidden" />
                                    <span className="sr-only min-[360px]:hidden">{labels.searchButton}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </section>

            <section className="min-h-screen bg-white py-12 sm:py-16 lg:py-20" aria-labelledby="marketplace-heading">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="space-y-10">
                        <header className="space-y-3 text-center">
                            <p className="break-words text-xs font-bold uppercase tracking-widest text-primary">
                                {labels.contentEyebrow}
                            </p>
                            <h2 id="marketplace-heading" className="break-words text-2xl font-bold text-foreground sm:text-4xl lg:text-5xl">
                                {labels.contentTitle}
                            </h2>
                            <div
                                className="no-scrollbar flex max-w-full items-center justify-start gap-2 overflow-x-auto overflow-y-hidden px-1 pb-2 pt-4 sm:flex-wrap sm:justify-center"
                                role="group"
                                aria-label={labels.contentEyebrow}
                            >
                                <button
                                    type="button"
                                    aria-pressed={selectedCategory === "all"}
                                    onClick={() => setSelectedCategory("all")}
                                    className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:text-sm ${selectedCategory === "all"
                                        ? "bg-primary text-primary-foreground shadow-md shadow-primary/25 scale-105"
                                        : "border border-border/60 bg-background/80 text-muted-foreground hover:bg-accent hover:text-accent-foreground hover:border-border"
                                        }`}
                                >
                                    {labels.categories["all"] ?? "All"}
                                </button>

                                {tagsList.map((tag) => {
                                    const categoryKey = tag.id;
                                    const categoryLabel = locale === "ar" ? tag.name_ar : tag.name_en;

                                    return (
                                        <button
                                            key={tag.id}
                                            type="button"
                                            aria-pressed={selectedCategory === categoryKey}
                                            onClick={() => setSelectedCategory(categoryKey)}
                                            className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:text-sm ${selectedCategory === categoryKey
                                                ? "bg-primary text-primary-foreground shadow-md shadow-primary/25 scale-105"
                                                : "border border-border/60 bg-background/80 text-muted-foreground hover:bg-accent hover:text-accent-foreground hover:border-border"
                                                }`}
                                        >
                                            {categoryLabel}
                                        </button>
                                    );
                                })}
                            </div>
                        </header>

                        <p className="sr-only" aria-live="polite">
                            {filteredSystems.length} {labels.contentEyebrow}
                        </p>

                        {isLoadingSystems ? (
                            <p className="py-16 text-center text-sm text-muted-foreground" role="status">
                                {labels.loading}
                            </p>
                        ) : systemsError ? (
                            <p className="py-16 text-center text-sm text-destructive" role="alert">
                                {labels.error}
                            </p>
                        ) : filteredSystems.length === 0 ? (
                            <div className="space-y-2 py-16 text-center text-muted-foreground sm:py-20">
                                <p className="break-words text-lg font-medium">{labels.emptyTitle}</p>
                                <p className="break-words text-sm">{labels.emptyDescription}</p>
                            </div>
                        ) : (
                            <div className="grid min-w-0 grid-cols-1 gap-4 pt-2 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
                                {filteredSystems.map((system) => (
                                    <SystemCard key={system.id} system={system} labels={cardLabels} />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </section>
        </main>
    );
}
