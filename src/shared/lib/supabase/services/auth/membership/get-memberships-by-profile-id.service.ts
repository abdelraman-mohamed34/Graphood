// src/shared/lib/supabase/services/memberships/get-memberships-by-profile-id.service.ts

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Membership } from "@/shared/lib/schemas/memberships.schema";
import type { Tenant } from "@/shared/lib/schemas/tenants.schema";

export type MembershipWithTenant = Membership & { tenant: Tenant };

export async function getMembershipsByProfileId<T = MembershipWithTenant>(
    supabase: SupabaseClient,
    profileId: string
): Promise<T[]> {
    if (!profileId) {
        throw new Error("Profile ID is required.");
    }

    const { data, error } = await supabase
        .from("memberships")
        .select(`
            *,
            tenant:tenants(*)
        `)
        .eq("profile_id", profileId);

    if (error) {
        console.error(
            "[Supabase Error] Error fetching memberships:",
            JSON.stringify(error, null, 2)
        );
        throw error;
    }

    return (data ?? []) as T[];
}
