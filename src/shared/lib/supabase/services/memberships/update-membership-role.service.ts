// src/shared/lib/supabase/services/memberships/transfer-ownership.service.ts

import { createAdminClient } from "@/shared/lib/supabase/admin";

type TransferOwnershipInput = {
    currentOwnerMembershipId: string;
    newOwnerMembershipId: string;
};

export async function transferOwnership({
    currentOwnerMembershipId,
    newOwnerMembershipId,
}: TransferOwnershipInput) {
    const supabase = createAdminClient();

    const { data, error } = await supabase.rpc(
        "transfer_workspace_ownership",
        {
            current_owner_membership_id: currentOwnerMembershipId,
            new_owner_membership_id: newOwnerMembershipId,
        }
    );

    if (error) {
        throw error;
    }

    return data;
}