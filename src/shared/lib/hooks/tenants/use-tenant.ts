"use client";

import { useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    useMutation,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { createClient } from "@/shared/lib/supabase/client";
import { useAuth } from "@/shared/lib/auth/auth-context";
import { hasPermission } from "@/shared/lib/auth/requires/require-permission";
import { getMembershipBySlug } from "@/shared/lib/supabase/services/memberships/get-membership.service";
import { updateTenantAction } from "@/shared/lib/actions/tenants/update-tenant.action";
import type { UpdateTenant } from "@/shared/lib/schemas/tenants.schema";
import { useTranslations } from "next-intl";

export function useTenant() {
    const router = useRouter();
    const t = useTranslations("global.errors");

    const { tenant_slug, locale } = useParams<{
        tenant_slug: string;
        locale: string;
    }>();

    const queryClient = useQueryClient();

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

    const {
        mutate: updateTenant,
        mutateAsync: updateTenantAsync,
        isPending: isUpdating,
    } = useMutation({
        mutationKey: ["tenant", tenant_slug, "update"],

        mutationFn: (data: UpdateTenant) =>
            updateTenantAction({
                tenantSlug: tenant_slug,
                locale,
                data,
            }),

        onSuccess: async (result) => {
            if (!result.success) {
                toast.error(t("tenantUpdate"));
                return;
            }

            toast.success(result.message);

            const newSlug = result.tenant?.slug;

            if (newSlug && newSlug !== tenant_slug) {
                queryClient.removeQueries({
                    queryKey: ["membership", tenant_slug, user?.id],
                });

                router.replace(
                    `/${locale}/${newSlug}/dashboard/settings`
                );

                return;
            }

            await queryClient.invalidateQueries({
                queryKey: ["membership", tenant_slug, user?.id],
            });

            router.refresh();
        },

        onError: () => {
            toast.error(t("tenantUpdate"));
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
        isUpdating,
        error,
        refetch,
        updateTenant,
        updateTenantAsync,
    };
}
