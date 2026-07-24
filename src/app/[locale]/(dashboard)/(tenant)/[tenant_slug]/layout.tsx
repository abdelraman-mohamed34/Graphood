import { redirect } from "next/navigation";
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import { createSupabaseServerClient } from "@/shared/lib/supabase/server";
import { getMembershipBySlug } from "@/shared/lib/supabase/services/memberships/get-membership.service";
import { hasPermission } from "@/shared/lib/auth/requires/require-permission";
import { AppSidebar } from "./dashboard/_components/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { getMembershipsByTenantSlug } from "@/shared/lib/supabase/services/memberships/get-memberships-by-slug.service";

interface TenantLayoutProps {
    children: React.ReactNode;
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
    const supabase = await createSupabaseServerClient();
    const queryClient = new QueryClient();

    const { data: { user }, } = await supabase.auth.getUser();

    if (!user) {
        redirect(`/${locale}/login`);
    }

    const membershipData = await queryClient.fetchQuery({
        queryKey: ["membership", tenant_slug, user.id],
        queryFn: () =>
            getMembershipBySlug({
                supabase: supabase,
                userId: user.id,
                tenantSlug: tenant_slug,
            }),
    });

    if (!membershipData || !hasPermission(membershipData, "dashboard.read")) {
        redirect(`/${locale}/workspaces?error=unauthorized`);
    }

    // fetch all tenant memberships
    await queryClient.prefetchQuery({
        queryKey: ["memberships", tenant_slug],
        queryFn: () =>
            getMembershipsByTenantSlug({
                supabase: supabase,
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