"use client";

import { useParams, useRouter } from "next/navigation";
import {
    useMutation,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query";

import { createClient } from "../../supabase/client";
import { getMembershipsByTenantSlug } from "../../supabase/services/memberships/get-memberships-by-slug.service";
import { getMembershipBySlug } from "../../supabase/services/memberships/get-membership.service";
import { removeMemberAction } from "../../actions/memberships/remove-member.action";
import { useUser } from "../auth";

export function useMemberships() {
    const router = useRouter();
    const params = useParams();
    const supabase = createClient();
    const queryClient = useQueryClient();

    const { profile } = useUser();
    const tenantSlug = params?.tenant_slug as string;
    const locale = params?.locale as string;

    const {
        data: memberships = [],
        isLoading: isFetching,
        error: fetchingError,
    } = useQuery({
        queryKey: ["memberships", tenantSlug],
        queryFn: () =>
            getMembershipsByTenantSlug({
                supabase,
                tenantSlug,
            }),
        enabled: !!tenantSlug,
        staleTime: 1000 * 60 * 5,
    });

    const {
        mutate: removeMember,
        mutateAsync: removeMemberAsync,
        isPending: isRemoving,
        error: removeMemberError,
    } = useMutation({
        mutationKey: ["memberships", tenantSlug, "manage", "remove"],

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
        }
    });

    const {
        data: currentMembership,
        isLoading: isCurrentMembershipLoading,
    } = useQuery({
        queryKey: ["current-membership", tenantSlug, profile?.id],

        queryFn: () =>
            getMembershipBySlug({
                userId: profile!.id,
                tenantSlug,
                supabase,
            }),

        enabled: !!tenantSlug && !!profile?.id,

        staleTime: 1000 * 60 * 5,
    });

    return {
        memberships,
        isLoading: isFetching || isRemoving || isCurrentMembershipLoading,
        error: fetchingError ?? removeMemberError,
        currentMembership,
        removeMember,
        removeMemberAsync,
    };
}