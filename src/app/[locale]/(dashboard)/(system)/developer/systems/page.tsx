'use client';

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@/i18n/navigation";
import { useSystem } from "@/shared/lib/hooks";
import { ArrowUpRight, Plus, Terminal } from "lucide-react";

export default function Page() {
    const t = useTranslations("developerSystems");
    const { isLoading, currentSystems } = useSystem();

    return (
        <div className="p-6 space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-6">
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">
                        {t("dashboardTitle")}
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        {t("dashboardSubtitle")}
                    </p>
                </div>

                <Link href="/developer/systems/add">
                    <Button className="w-full sm:w-auto shadow-sm">
                        <Plus className="me-2 h-4 w-4" />
                        {t("newSystemBtn")}
                    </Button>
                </Link>
            </div>

            {/* Content Area */}
            {isLoading ? (
                /* Skeleton Loading Grid */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div
                            key={i}
                            className="p-5 border border-border/60 rounded-xl bg-card/30 space-y-4 animate-pulse"
                        >
                            <div className="flex justify-between items-start">
                                <Skeleton className="h-5 w-32" />
                                <Skeleton className="h-4 w-4 rounded-full" />
                            </div>
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-2/3" />
                        </div>
                    ))}
                </div>
            ) : currentSystems?.length === 0 ? (
                /* Empty State */
                <div className="border border-dashed border-border/80 rounded-xl p-12 text-center space-y-4 bg-card/10">
                    <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mx-auto">
                        <Terminal className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <div className="space-y-1">
                        <h3 className="font-semibold text-lg text-foreground">
                            {t("emptyTitle")}
                        </h3>
                        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                            {t("emptyDescription")}
                        </p>
                    </div>
                    <Link href="/developer/systems/add" className="inline-block pt-2">
                        <Button variant="outline">
                            <Plus className="me-2 h-4 w-4" />
                            {t("createFirstSystem")}
                        </Button>
                    </Link>
                </div>
            ) : (
                /* Systems Grid */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {currentSystems?.map((system) => (
                        <Link
                            href={`/developer/systems/${system.id}`}
                            key={system.id}
                            className="group relative p-5 border border-border/60 rounded-xl bg-card/30 hover:bg-card/60 hover:border-primary/40 backdrop-blur-sm transition-all duration-200 flex flex-col justify-between space-y-4 shadow-sm hover:shadow-md"
                        >
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-semibold text-base text-foreground group-hover:text-primary transition-colors line-clamp-1">
                                        {system.name}
                                    </h3>
                                    <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                                </div>
                                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                                    {system.description || t("noDescription")}
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}