"use client";

import { useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    useMutation,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query";

import { createClient } from "../../supabase/client";

import { getMembershipBySlug } from "../../supabase/services/memberships/get-membership.service";
import { getMembershipsByTenantSlug } from "../../supabase/services/memberships/get-memberships-by-slug.service";

import { removeMemberAction } from "../../actions/memberships/remove-member.action";

import { useUser } from "../auth";

export function useMemberships() {
    const router = useRouter();
    const params = useParams();
    const queryClient = useQueryClient();

    const supabase = useMemo(() => createClient(), []);

    const { profile } = useUser();

    const tenantSlug = params.tenant_slug as string;
    const locale = params.locale as string;

    const membershipsQuery = useQuery({
        queryKey: ["memberships", tenantSlug],
        enabled: !!tenantSlug,
        staleTime: 1000 * 60 * 5,
        queryFn: () =>
            getMembershipsByTenantSlug({
                supabase,
                tenantSlug,
            }),
    });

    const currentMembershipQuery = useQuery({
        queryKey: ["current-membership", tenantSlug, profile?.id],
        enabled: !!tenantSlug && !!profile?.id,
        staleTime: 1000 * 60 * 5,
        queryFn: () =>
            getMembershipBySlug({
                supabase,
                tenantSlug,
                userId: profile!.id,
            }),
    });

    const removeMemberMutation = useMutation({
        mutationKey: ["memberships", tenantSlug, "remove"],

        mutationFn: async (membershipId: string) => {
            const result = await removeMemberAction(
                locale,
                tenantSlug,
                membershipId
            );

            if (!result.success) {
                throw new Error(result.message);
            }

            return result;
        },

        onSuccess: async (result) => {
            if (result.selfRemoval) {
                router.push("/workspaces");
                return;
            }

            await queryClient.invalidateQueries({
                queryKey: ["memberships", tenantSlug],
            });
        },
    });

    return {
        memberships: membershipsQuery.data ?? [],

        currentMembership: currentMembershipQuery.data ?? null,

        removeMember: removeMemberMutation.mutate,
        removeMemberAsync: removeMemberMutation.mutateAsync,

        isLoading:
            membershipsQuery.isLoading ||
            currentMembershipQuery.isLoading,

        isRemoving: removeMemberMutation.isPending,

        error:
            membershipsQuery.error ??
            currentMembershipQuery.error ??
            removeMemberMutation.error,
    };
}