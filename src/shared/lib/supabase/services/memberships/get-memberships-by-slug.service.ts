// src/shared/lib/supabase/services/memberships/get-membership-by-slug.service.ts
import type { SupabaseClient } from "@supabase/supabase-js";
import { Membership } from "@/shared/lib/schemas/memberships.schema";

interface GetMembershipsBySlugParams {
    tenantSlug: string;
    supabase: SupabaseClient;
}

export async function getMembershipsByTenantSlug({
    tenantSlug,
    supabase,
}: GetMembershipsBySlugParams): Promise<Membership[] | null> {

    const { data, error } = await supabase
        .from("memberships")
        .select(`
            id,
            profile_id,
            tenant_id,
            current_tenant_id,
            role,
            permissions,
            status,
            invited_by,
            joined_at,
            created_at,
            updated_at,
            tenants!inner(slug),
         
            profile:profiles!memberships_profile_id_fkey(
            first_name,
            last_name
            ),

            inviter:profiles!memberships_invited_by_fkey(
            first_name,
            last_name
            )
        `)
        .eq("tenants.slug", tenantSlug);

    if (error) {
        throw error;
    }

    if (!data) {
        return null;
    }

    const sanitizedData = data.map((membership) => ({
        ...membership,
        permissions: membership.permissions ?? [],
    }));

    return sanitizedData as unknown as Membership[];
}
