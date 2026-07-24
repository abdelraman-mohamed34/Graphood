// src/app/[locale]/(dashboard)/(tenant)/[tenant_slug]/dashboard/quickview
"use client";

import { Suspense } from "react";
import { SidebarInset } from "@/components/ui/sidebar";
import { Dir } from "@/shared/_components/Dirs";
import { SiteHeader } from "../_components/site-header";
import { SectionCards } from "../_components/section-cards";
import GoLive from "./_components/go-live";
import { QuickViewCard } from "./_components/quick-view-card";
import { useTenant } from "@/shared/lib/hooks";

export default function Page() {
    const { tenantId, isLoading } = useTenant();

    if (isLoading) {
        return (
            <SidebarInset>
                <div className="flex h-full items-center justify-center">
                    Loading...
                </div>
            </SidebarInset>
        );
    }

    if (!tenantId) {
        return null;
    }

    return (
        <SidebarInset>
            <SiteHeader title="document" />

            <Dir />

            <Suspense fallback={null}>
                <GoLive />
            </Suspense>

            <div className="@container/main flex flex-1 flex-col gap-6 p-4 md:p-6">
                <SectionCards tenantId={tenantId} />
                <QuickViewCard tenantId={tenantId} />
            </div>
        </SidebarInset>
    );
}