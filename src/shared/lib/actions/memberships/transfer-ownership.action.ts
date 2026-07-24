"use server";

import { hasPermission } from "@/shared/lib/auth/requires/require-permission";
import { requireMembership } from "@/shared/lib/auth/requires/require-membership";
import { requireUser } from "@/shared/lib/auth/requires/require-user";

import { transferOwnership } from "../../supabase/services/memberships/update-membership-role.service";

export async function transferOwnershipAction(
    locale: string,
    tenantSlug: string,
    newOwnerMembershipId: string
) {
    try {
        const { supabase, user } = await requireUser(locale);

        const currentMembership = await requireMembership({
            tenantSlug,
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

        if (currentMembership.id === newOwnerMembershipId) {
            return {
                success: false,
                message:
                    "You are already the owner of this workspace.",
            };
        }

        const { data: targetMembership, error } = await supabase
            .from("memberships")
            .select("id, tenant_id, role")
            .eq("id", newOwnerMembershipId)
            .maybeSingle();

        if (error) {
            throw error;
        }

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
            newOwnerMembershipId,
        });

        return {
            success: true,
            message: "Ownership transferred successfully.",
        };
    } catch (error) {
        console.error(
            "[Transfer Ownership Action Error]:",
            error
        );

        return {
            success: false,
            message: "Failed to transfer ownership.",
        };
    }
}