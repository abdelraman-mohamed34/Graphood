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
    labels: Pick<MarketplaceLabels, "cardBadge" | "cardViewDetails">;
}) {
    return (
        <Link
            href={`/marketplace/systems/${system.id}`}
            className="group min-w-0 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
            <article className="flex h-full min-w-0 flex-col justify-between gap-6 overflow-hidden rounded-2xl border border-border bg-card p-4 shadow-xs transition-[border-color,box-shadow] duration-200 group-hover:border-primary/50 group-hover:shadow-lg sm:p-6">
                <div className="flex min-w-0 items-start justify-between gap-3">
                    <div className="grid size-12 shrink-0 place-items-center overflow-hidden rounded-xl border border-border bg-muted transition-transform duration-200 group-hover:scale-105">
                        {system.icon_url ? (
                            <Image
                                src={system.icon_url}
                                alt=""
                                width={32}
                                height={32}
                                sizes="32px"
                                className="size-8 object-contain"
                            />
                        ) : (
                            <Layers aria-hidden="true" className="size-6 text-primary stroke-[1.75]" />
                        )}
                    </div>

                    <span className="max-w-[55%] shrink-0 truncate rounded-md border border-primary/20 bg-primary/10 px-2.5 py-1 text-[0.625rem] font-bold uppercase tracking-wider text-primary">
                        {labels.cardBadge}
                    </span>
                </div>

                <div className="min-w-0 space-y-2 text-start">
                    <h2 className="break-words text-lg font-bold text-card-foreground transition-colors group-hover:text-primary">
                        {system.name}
                    </h2>
                    <p className="line-clamp-2 break-words text-sm leading-relaxed text-muted-foreground">
                        {system.description}
                    </p>
                </div>

                <div className="flex min-w-0 items-center justify-between gap-3 border-t border-border pt-4 text-xs font-semibold text-muted-foreground transition-colors group-hover:text-primary">
                    <span className="min-w-0 break-words">{labels.cardViewDetails}</span>
                    <ExternalLink
                        aria-hidden="true"
                        className="size-4 shrink-0 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5"
                    />
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
        }),
        [labels.cardBadge, labels.cardViewDetails]
    );

    return (
        <main className="min-h-screen min-w-0 overflow-x-clip bg-background text-foreground">
            <section className="relative overflow-hidden bg-zinc-950 py-14 text-white sm:py-20">
                <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-0 h-64 w-[min(37.5rem,120vw)] -translate-x-1/2 rounded-full bg-primary/25 blur-[8rem]" />

                <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-4xl space-y-5 text-center sm:space-y-6">
                        <h1 className="break-words text-2xl font-bold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
                            {labels.heroTitleLineOne}{" "}
                            <span className="sm:block">{labels.heroTitleLineTwo}</span>
                        </h1>

                        <p className="mx-auto max-w-2xl break-words text-sm leading-relaxed text-zinc-400 sm:text-base">
                            {labels.heroDescription}
                        </p>

                        <form
                            role="search"
                            className="mx-auto max-w-2xl pt-2"
                            onSubmit={(event) => event.preventDefault()}
                        >
                            <label htmlFor="marketplace-search" className="sr-only">
                                {labels.searchPlaceholder}
                            </label>
                            <div className="flex min-w-0 items-center rounded-2xl border border-zinc-800 bg-zinc-900/90 p-1.5 shadow-2xl backdrop-blur-md transition-colors focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/30">
                                <Search aria-hidden="true" className="ms-2 size-5 shrink-0 text-zinc-400 sm:ms-3" />
                                <input
                                    id="marketplace-search"
                                    type="search"
                                    value={searchQuery}
                                    onChange={(event) => setSearchQuery(event.target.value)}
                                    placeholder={labels.searchPlaceholder}
                                    autoComplete="off"
                                    className="min-w-0 flex-1 bg-transparent px-2 py-2 text-sm text-white outline-none placeholder:text-zinc-500 sm:text-base"
                                />
                                <button
                                    type="submit"
                                    className="shrink-0 rounded-xl bg-primary px-3 py-2.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 sm:px-6 sm:text-sm"
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

            <section className="min-h-screen bg-muted/40 py-12 sm:py-16 lg:py-20" aria-labelledby="marketplace-heading">
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
