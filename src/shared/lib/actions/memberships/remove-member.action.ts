'use server'

import { hasPermission } from "@/shared/lib/auth/requires/require-permission";
import { requireUser } from "@/shared/lib/auth/requires/require-user";
import { requireMembership } from "@/shared/lib/auth/requires/require-membership";
import { removeMemberFromTenant } from "@/shared/lib/supabase/services/memberships/remove-membership-from-tenant.service";

export async function removeMemberAction(
    locale: string,
    tenantSlug: string,
    membershipId: string
) {
    try {
        const { supabase, user } = await requireUser(locale);

        const currentMembership = await requireMembership({
            tenantSlug,
            userId: user.id,
            supabase,
        });

        const isSelfRemoval =
            currentMembership.id === membershipId;

        // OWNER cannot remove himself
        if (
            isSelfRemoval &&
            currentMembership.role === "OWNER"
        ) {
            return {
                success: false,
                message: "Owner cannot leave the tenant.",
            };
        }

        const canRemoveOthers = hasPermission(
            currentMembership,
            "members.remove"
        );

        if (!isSelfRemoval && !canRemoveOthers) {
            return {
                success: false,
                message: "You don't have permission to remove members.",
            };
        }

        await removeMemberFromTenant(
            supabase,
            membershipId
        );

        return {
            success: true,
            selfRemoval: isSelfRemoval,
            message: isSelfRemoval
                ? "You left the tenant successfully."
                : "Member removed successfully.",
        };

    } catch (error) {
        console.error("[Remove Member Action Error]:", error);

        return {
            success: false,
            message: "Failed to remove member.",
        };
    }
}