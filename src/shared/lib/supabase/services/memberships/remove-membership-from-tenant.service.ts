import { SupabaseClient } from "@supabase/supabase-js";
import { hasPermission } from "@/shared/lib/auth/requires/require-permission";

type RemoveMemberFromTenantInput = {
    membershipId: string;
    tenantId: string;
};

export async function removeMemberFromTenant(
    supabase: SupabaseClient,
    { membershipId, tenantId }: RemoveMemberFromTenantInput,
) {
    const {
        data: {
            user
        },
        error: userError
    } = await supabase.auth.getUser();

    if (userError || !user) {
        throw new Error("Unauthorized");
    }

    const { data: targetMembership, error: targetError } = await supabase
        .from("memberships")
        .select("id, profile_id, tenant_id, role, permissions")
        .eq("id", membershipId)
        .eq("tenant_id", tenantId)
        .single();

    if (targetError || !targetMembership) {
        throw new Error("Membership not found");
    }

    // Exit tenant
    const isSelf = targetMembership.profile_id === user.id;

    if (!isSelf) {
        const { data: currentMembership, error: currentError } =
            await supabase
                .from("memberships")
                .select("id, profile_id, tenant_id, role, permissions")
                .eq("profile_id", user.id)
                .eq("tenant_id", targetMembership.tenant_id)
                .single();

        if (currentError || !currentMembership) {
            throw new Error("No tenant membership found");
        }

        const canRemoveOthers = hasPermission(
            currentMembership,
            "members.remove",
        );

        if (!canRemoveOthers) {
            throw new Error("You don't have permission to remove members");
        }
    }

    const { error } = await supabase
        .from("memberships")
        .delete()
        .eq("id", membershipId)
        .eq("tenant_id", tenantId);

    if (error) throw error;

    return true;
}
