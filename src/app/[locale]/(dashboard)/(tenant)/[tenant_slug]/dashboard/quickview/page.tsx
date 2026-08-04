// src/app/[locale]/(dashboard)/(tenant)/[tenant_slug]/dashboard/quickview
"use client";

import { Suspense } from "react";
import { SidebarInset } from "@/components/ui/sidebar";
import { Dir } from "@/shared/_components/dirs";
import { SiteHeader } from "../_components/site-header";
import { SectionCards } from "../_components/section-cards";
import GoLive from "./_components/go-live";
import { QuickViewCard } from "./_components/quick-view-card";
import { useTenant } from "@/shared/lib/hooks";
import { useTranslations } from "next-intl";

export default function Page() {
    const { tenantId, isLoading } = useTenant();
    const t = useTranslations("dashboard.quickview");

    if (isLoading) {
        return (
            <SidebarInset>
                <div className="flex h-full items-center justify-center">
                    {t("loading")}
                </div>
            </SidebarInset>
        );
    }

    if (!tenantId) {
        return null;
    }

    return (
        <SidebarInset>
            <SiteHeader title={t("title")} />

            <Dir />

            <Suspense fallback={null}>
                <GoLive />
            </Suspense>

            <div className="@container/main flex flex-1 flex-col gap-6 p-4 md:p-6">
                <SectionCards />
                <QuickViewCard />
            </div>
        </SidebarInset>
    );
}
