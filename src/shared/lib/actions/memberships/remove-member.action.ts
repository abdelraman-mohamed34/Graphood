'use server'

import { hasPermission } from "@/shared/lib/auth/requires/require-permission";
import { requireUser } from "@/shared/lib/auth/requires/require-user";
import { requireMembership } from "@/shared/lib/auth/requires/require-membership";
import { removeMemberFromTenant } from "@/shared/lib/supabase/services/memberships/remove-membership-from-tenant.service";
import { z } from "zod";

const removeMemberSchema = z.object({ locale: z.enum(["ar", "en"]), tenantSlug: z.string().min(1).max(100), membershipId: z.string().uuid() }).strict();

export async function removeMemberAction(
    locale: string,
    tenantSlug: string,
    membershipId: string
) {
    try {
        const input = removeMemberSchema.parse({ locale, tenantSlug, membershipId });
        const { supabase, user } = await requireUser(input.locale);

        const currentMembership = await requireMembership({
            tenantSlug: input.tenantSlug,
            userId: user.id,
            supabase,
        });

        const isSelfRemoval =
            currentMembership.id === input.membershipId;

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
            input.membershipId
        );

        return {
            success: true,
            selfRemoval: isSelfRemoval,
            message: isSelfRemoval
                ? "You left the tenant successfully."
                : "Member removed successfully.",
        };

    } catch {

        return {
            success: false,
            message: "Failed to remove member.",
        };
    }
}
