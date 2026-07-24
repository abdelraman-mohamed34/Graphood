"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/shared/lib/supabase/client";
import { useAuth } from "@/shared/lib/auth/auth-context";
import { getMembershipBySlug } from "@/shared/lib/supabase/services/memberships/get-membership.service";
import { hasPermission } from "@/shared/lib/auth/requires/require-permission";

export function useTenant() {
    const { tenant_slug } = useParams<{
        tenant_slug: string;
    }>();
    const { user, isLoading: authLoading } = useAuth();

    const {
        data: membership,
        isLoading: membershipLoading,
        error,
        refetch,
    } = useQuery({
        queryKey: ["membership", tenant_slug, user?.id],
        enabled: !!user && !!tenant_slug,
        staleTime: 1000 * 60 * 5,
        queryFn: async () => {
            const supabase = createClient();
            return getMembershipBySlug({
                supabase,
                userId: user!.id,
                tenantSlug: tenant_slug,
            });
        },
    });

    const role = useMemo(
        () => membership?.role?.toUpperCase() ?? null,
        [membership]
    );

    const permissions = useMemo(() => {
        if (!membership) {
            return {
                canManageWorkspace: false,
                canManageMembers: false,
                canManageBilling: false,
                canDeleteWorkspace: false,
            };
        }

        return {
            canManageWorkspace: hasPermission(
                membership,
                "tenant.manage"
            ),
            canManageMembers: hasPermission(
                membership,
                "members.manage"
            ),
            canManageBilling: hasPermission(
                membership,
                "billing.manage"
            ),
            canDeleteWorkspace: hasPermission(
                membership,
                "tenant.delete"
            ),
        };
    }, [membership]);

    return {
        user,
        tenant: membership?.tenant ?? null,
        tenantId: membership?.tenant_id ?? null,
        tenantSlug: membership?.tenant?.slug ?? null,
        membership,
        role,
        permissions,
        hasAccess: !!membership,
        isLoading: authLoading || membershipLoading,
        error,
        refetch,
    };
}