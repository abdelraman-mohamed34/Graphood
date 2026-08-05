"use server";

import { ReactNode } from "react";
import { redirect } from "next/navigation";
import {
    dehydrate,
    HydrationBoundary,
} from "@tanstack/react-query";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./dashboard/_components/app-sidebar";
import { requireUser } from "@/shared/lib/auth/requires/require-user";
import { requireMembership } from "@/shared/lib/auth/requires/require-membership";
import { hasPermission } from "@/shared/lib/auth/requires/require-permission";
import { getMembershipsByTenantSlug } from "@/shared/lib/supabase/services/memberships/get-memberships-by-slug.service";
import { createQueryClient, queryKeys } from "@/shared/lib/query";

interface TenantLayoutProps {
    children: ReactNode;
    params: Promise<{
        locale: string;
        tenant_slug: string;
    }>;
}

export default async function TenantLayout({
    children,
    params,
}: TenantLayoutProps) {
    const { locale, tenant_slug } = await params;

    const queryClient = createQueryClient();

    const { user, supabase } = await requireUser(locale);

    const membership = await requireMembership({
        supabase,
        tenantSlug: tenant_slug,
        userId: user.id,
        redirectTo: `/${locale}/workspaces?error=unauthorized`,
    });

    if (!hasPermission(membership, "dashboard.read")) {
        redirect(`/${locale}/workspaces?error=unauthorized`);
    }

    queryClient.setQueryData(
        queryKeys.tenants.membership(tenant_slug, user.id),
        membership
    );

    await queryClient.prefetchQuery({
        queryKey: queryKeys.tenants.memberships(tenant_slug),
        queryFn: () =>
            getMembershipsByTenantSlug({
                supabase,
                tenantSlug: tenant_slug,
            }),
    });


    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <SidebarProvider
                style={
                    {
                        "--sidebar-width": "calc(var(--spacing) * 72)",
                        "--header-height": "calc(var(--spacing) * 12)",
                    } as React.CSSProperties
                }
            >
                <AppSidebar variant="inset" />
                {children}
            </SidebarProvider>
        </HydrationBoundary>
    );
}
