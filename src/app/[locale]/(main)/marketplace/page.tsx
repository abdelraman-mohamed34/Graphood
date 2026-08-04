'use client';

import { useState } from "react";
import Image from "next/image";
import { useSystem } from "@/shared/lib/hooks/systems/use-system";
import Loading from "../_components/test/loading";
import { Link } from "@/i18n/navigation";
import { Search, ExternalLink, Layers } from "lucide-react";
import { useTranslations } from "next-intl";

const CATEGORIES = ["all", "popular", "developerTools", "security", "ecommerce", "monitoring"] as const;
type Category = (typeof CATEGORIES)[number];

export default function Page() {
    const { systems = [], isLoading, error } = useSystem();
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<Category>("all");

    const t = useTranslations("marketplace");

    const filteredSystems = systems.filter((sub) =>
        sub.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (error) {
        return (
            <div className="flex justify-center items-center min-h-screen text-destructive">
                <p>{t("error")}</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-foreground">

            <section dir="ltr" className="relative overflow-hidden bg-zinc-950 text-white pt-16 pb-20 px-4 sm:px-6">

                {/* Glow Banner Effect */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[280px] bg-primary/25 blur-[130px] rounded-full pointer-events-none" />

                <div className="max-w-4xl mx-auto text-center space-y-6 relative z-10">

                    {/* Title */}
                    <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white leading-tight">
                        {t("hero.titleLineOne")} <br className="hidden sm:inline" />
                        {t("hero.titleLineTwo")}
                    </h1>

                    <p className="text-sm sm:text-base text-zinc-400 max-w-2xl mx-auto leading-relaxed">
                        {t("hero.description")}
                    </p>

                    {/* 🔍 Hero Search Bar */}
                    <div className="pt-2 max-w-2xl mx-auto">
                        <div className="relative flex items-center bg-zinc-900/90 border border-zinc-800 rounded-2xl p-1.5 shadow-2xl backdrop-blur-md focus-within:border-primary transition-all">
                            <Search className="w-5 h-5 text-zinc-400 ms-3 me-2 shrink-0" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder={t("search.placeholder")}
                                className="w-full bg-transparent text-sm sm:text-base text-white placeholder-zinc-500 focus:outline-none px-2 py-2"
                            />
                            <button className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer shrink-0">
                                {t("search.button")}
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* 2️⃣ Main Content (Cards Area) */}
            <section className="bg-muted/40 min-h-screen pt-12 pb-24 px-4 sm:px-6">
                <div className="max-w-7xl mx-auto space-y-10">

                    {/* Header Details */}
                    <div className="text-center space-y-3">
                        <span className="text-xs font-bold tracking-widest text-primary uppercase">
                            {t("content.eyebrow")}
                        </span>
                        <h2 className="text-2xl sm:text-4xl font-bold text-foreground">
                            {t("content.title")}
                        </h2>

                        {/* Category Tabs */}
                        <div className="flex items-center justify-center gap-2 overflow-x-auto pt-4 pb-2 px-2 dir-ltr">
                            {CATEGORIES.map((category) => (
                                <button
                                    key={category}
                                    onClick={() => setSelectedCategory(category)}
                                    className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all shrink-0 cursor-pointer ${selectedCategory === category
                                        ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                                        : "bg-card border border-border text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                                        }`}
                                >
                                    {t(`categories.${category}`)}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Cards Grid */}
                    {isLoading ? (
                        <div className="py-20">
                            <Loading />
                        </div>
                    ) : filteredSystems.length === 0 ? (
                        <div className="text-center py-20 text-muted-foreground space-y-2">
                            <p className="text-lg font-medium">{t("empty.title")}</p>
                            <p className="text-sm">{t("empty.description")}</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4" dir="ltr">
                            {filteredSystems.map((sub) => (
                                <Link
                                    key={sub.id || sub.name}
                                    href={`/marketplace/systems/${sub.id}`}
                                    className="group block"
                                >
                                    <div className="h-full bg-card border border-border rounded-2xl p-6 shadow-xs hover:shadow-xl hover:border-primary/50 transition-all duration-300 flex flex-col justify-between space-y-6">

                                        {/* Card Top */}
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-muted border border-border flex items-center justify-center overflow-hidden shrink-0 group-hover:scale-105 transition-transform">
                                                {sub.icon_url ? (
                                                    <Image
                                                        src={sub.icon_url}
                                                        alt={sub.name}
                                                        width={32}
                                                        height={32}
                                                        className="w-8 h-8 object-contain"
                                                    />
                                                ) : (
                                                    <Layers className="w-6 h-6 text-primary stroke-[1.75]" />
                                                )}
                                            </div>

                                            <span className="text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-md bg-primary/10 text-primary border border-primary/20">
                                                {t("card.badge")}
                                            </span>
                                        </div>

                                        {/* Content */}
                                        <div className="space-y-2 text-left">
                                            <h3 className="font-bold text-lg text-card-foreground group-hover:text-primary transition-colors">
                                                {sub.name}
                                            </h3>
                                            <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                                                {t("card.description", { name: sub.name })}
                                            </p>
                                        </div>

                                        {/* Footer Link */}
                                        <div className="pt-4 border-t border-border flex items-center justify-between text-xs font-semibold text-muted-foreground group-hover:text-primary transition-colors">
                                            <span>{t("card.viewDetails")}</span>
                                            <ExternalLink className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
