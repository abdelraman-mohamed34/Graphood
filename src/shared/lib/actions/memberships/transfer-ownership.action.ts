"use server";

import { hasPermission } from "@/shared/lib/auth/requires/require-permission";
import { requireMembership } from "@/shared/lib/auth/requires/require-membership";
import { requireUser } from "@/shared/lib/auth/requires/require-user";

import { transferOwnership } from "../../supabase/services/memberships/update-membership-role.service";
import { getMembershipById } from "@/shared/lib/supabase/services/memberships";
import { z } from "zod";

export async function transferOwnershipAction(
    locale: string,
    tenantSlug: string,
    newOwnerMembershipId: string
) {
    try {
        const context = z.object({ locale: z.enum(["ar", "en"]), tenantSlug: z.string().min(1).max(100) }).parse({ locale, tenantSlug });
        const targetMembershipId = z.string().uuid().parse(newOwnerMembershipId);
        const { supabase, user } = await requireUser(context.locale);

        const currentMembership = await requireMembership({
            tenantSlug: context.tenantSlug,
            userId: user.id,
            supabase,
        });

        if (currentMembership.role !== "OWNER") {
            return {
                success: false,
                message: "Only the owner can transfer ownership.",
            };
        }

        const canTransferOwnership = hasPermission(
            currentMembership,
            "members.transfer_ownership"
        );

        if (!canTransferOwnership) {
            return {
                success: false,
                message:
                    "You don't have permission to transfer ownership.",
            };
        }

        if (currentMembership.id === targetMembershipId) {
            return {
                success: false,
                message:
                    "You are already the owner of this workspace.",
            };
        }

        const targetMembership = await getMembershipById(supabase, targetMembershipId);

        if (!targetMembership) {
            return {
                success: false,
                message: "Member not found.",
            };
        }

        if (
            targetMembership.tenant_id !==
            currentMembership.tenant_id
        ) {
            return {
                success: false,
                message:
                    "Member does not belong to this workspace.",
            };
        }

        if (targetMembership.role !== "ADMIN") {
            return {
                success: false,
                message:
                    "Ownership can only be transferred to an admin.",
            };
        }

        await transferOwnership({
            currentOwnerMembershipId: currentMembership.id,
            newOwnerMembershipId: targetMembershipId,
        });

        return {
            success: true,
            message: "Ownership transferred successfully.",
        };
    } catch {

        return {
            success: false,
            message: "Failed to transfer ownership.",
        };
    }
}
