"use client";

import { use } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ShieldCheck, Tag } from "lucide-react";

import { Badge as StatusBadge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import DeveloperDashboardContainer from "@/shared/_components/developer-dashboard-container";
import { useSystem } from "@/shared/lib/hooks";
import { useTags } from "@/shared/lib/hooks/tags/use-tag";

interface PageProps {
    params: Promise<{
        system_id: string;
    }>;
}

export default function Page({ params }: PageProps) {
    const t = useTranslations("developerOverview");
    const locale = useLocale();
    const { system_id } = use(params);
    const { system, isSingleLoading, error } = useSystem(system_id);
    const { data: availableTags = [] } = useTags();

    // 1. Loading State
    if (isSingleLoading) {
        return (
            <DeveloperDashboardContainer className="bg-card text-card-foreground py-6 space-y-4">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-64 rounded-md" />
                    <Skeleton className="h-4 w-96 rounded-md" />
                </div>
                <div className="flex items-center gap-6 pt-3 border-t border-border/60">
                    <Skeleton className="h-6 w-32 rounded-full" />
                    <Skeleton className="h-6 w-32 rounded-full" />
                </div>
            </DeveloperDashboardContainer>
        );
    }

    // 2. Error or Not Found State
    if (error || !system) {
        return (
            <DeveloperDashboardContainer className="py-12">
                <div className="rounded-xl border border-destructive/50 bg-destructive/10 p-6 text-center text-destructive">
                    {t("systemNotFound")}
                </div>
            </DeveloperDashboardContainer>
        );
    }

    // 3. Main System Info Render
    const isActive = system.status === "ACTIVE";
    const systemTags = availableTags.filter((tag) => system.tags?.includes(tag.id));

    return (
        <DeveloperDashboardContainer>
            {/* System Info Card */}
            <div className="bg-card text-card-foreground py-6 space-y-4 border-b border-border/60">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            {system.name}
                        </h1>
                        {system.description && (
                            <p className="mt-1 text-sm text-muted-foreground max-w-2xl leading-relaxed">
                                {system.description}
                            </p>
                        )}
                    </div>
                </div>

                {/* Status & Category Badge Row */}
                <div className="flex flex-wrap items-center gap-6 pt-3 border-t border-border/60 text-sm">
                    {/* Status */}
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
                        <span className="text-muted-foreground">{t("statusLabel")}:</span>
                        <StatusBadge variant={isActive ? "default" : "secondary"}>
                            {isActive ? t("statusActive") : t("statusInactive")}
                        </StatusBadge>
                    </div>

                    {/* Category */}
                    <div className="flex items-center gap-2">
                        <Tag className="h-4 w-4 text-primary shrink-0" />
                        <span className="text-muted-foreground">{t("categoryLabel")}:</span>
                        <span className="font-medium text-foreground">
                            {systemTags.map((tag) => locale === "ar" ? tag.name_ar : tag.name_en).join(", ")}
                        </span>
                    </div>
                </div>
            </div>
        </DeveloperDashboardContainer>
    );
}
