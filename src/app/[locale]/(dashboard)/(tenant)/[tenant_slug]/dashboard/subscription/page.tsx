"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { SidebarInset } from "@/components/ui/sidebar";

import { Dir } from "@/shared/_components/dirs";
import DashboardContainer from "@/shared/_components/dashboard-container";


import { SiteHeader } from "../_components/site-header";
import SubscriptionOverview from "./_components/subscription-overview";
import UsageCards from "./_components/usage-cards";
import PlanLimits from "./_components/plan-limits";
import BillingSummary from "./_components/billing-summary";
import { useMemberships, useTenant } from "@/shared/lib/hooks";
import { useSubscription } from "@/shared/lib/hooks";

function SubscriptionSkeleton() {
    return (
        <div className="space-y-5">
            {/* Overview */}
            <div className="space-y-4 rounded-xl border p-6">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-72" />

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
                    {Array.from({ length: 5 }).map((_, index) => (
                        <div
                            key={index}
                            className="space-y-3 rounded-lg border p-4"
                        >
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-7 w-20" />
                        </div>
                    ))}
                </div>
            </div>

            {/* Usage */}
            <div className="space-y-4">
                <Skeleton className="h-6 w-32" />

                <div className="grid gap-4 sm:grid-cols-2">
                    {Array.from({ length: 2 }).map((_, index) => (
                        <div
                            key={index}
                            className="space-y-4 rounded-xl border p-5"
                        >
                            <Skeleton className="h-5 w-32" />
                            <Skeleton className="h-8 w-20" />
                            <Skeleton className="h-2 w-full" />
                        </div>
                    ))}
                </div>
            </div>

            {/* Limits */}
            <div className="space-y-4 rounded-xl border p-6">
                <Skeleton className="h-6 w-40" />

                {Array.from({ length: 2 }).map((_, index) => (
                    <Skeleton
                        key={index}
                        className="h-10 w-full"
                    />
                ))}
            </div>

            {/* Billing */}
            <div className="space-y-4 rounded-xl border p-6">
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-20 w-full" />
            </div>
        </div>
    );
}

export default function SubscriptionPage() {
    const { memberships } = useMemberships();
    const { membership } = useTenant();

    const tenantId = membership?.tenant_id;

    const {
        subscription,
        capabilities,
        isLoading,
    } = useSubscription(tenantId);

    if (isLoading) {
        return (
            <SidebarInset>
                <SiteHeader title="subscription" />
                <Dir />

                <DashboardContainer className="space-y-5">
                    <SubscriptionSkeleton />
                </DashboardContainer>
            </SidebarInset>
        );
    }

    if (!subscription || !capabilities) {
        return null;
    }

    return (
        <SidebarInset>
            <SiteHeader title="subscription" />
            <Dir />

            <DashboardContainer className="space-y-5">
                <SubscriptionOverview
                    subscription={subscription}
                    capabilities={capabilities}
                    isLoading={false}
                />

                <UsageCards
                    capabilities={capabilities}
                    memberships={memberships}
                />

                <PlanLimits
                    capabilities={capabilities}
                />

                <BillingSummary />
            </DashboardContainer>
        </SidebarInset>
    );
}