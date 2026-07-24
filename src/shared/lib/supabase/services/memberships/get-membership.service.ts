// src/shared/lib/supabase/services/memberships/get-membership.ts
import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import { membershipSchema } from "@/shared/lib/schemas/memberships.schema";

interface GetMembershipParams {
    userId: string;
    tenantSlug: string;
    supabase: SupabaseClient;
}

const membershipWithTenantSchema = membershipSchema.extend({
    tenant: z
        .object({
            id: z.string().uuid(),
            slug: z.string(),
            name: z.string(),
        })
        .nullable()
        .optional(),
});

export type MembershipWithTenant = z.infer<typeof membershipWithTenantSchema>;

export async function getMembershipBySlug({
    userId,
    tenantSlug,
    supabase,
}: GetMembershipParams): Promise<MembershipWithTenant | null> {
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
            tenant:tenants!inner(id, slug, name)
        `)
        .eq("profile_id", userId)
        .eq("tenants.slug", tenantSlug)
        .maybeSingle();

    if (error) {
        console.error("Error fetching membership:", error);
        throw error;
    }

    if (!data) {
        return null;
    }

    const sanitizedData = {
        ...data,
        permissions: data.permissions ?? [],
        tenant: Array.isArray(data.tenant)
            ? data.tenant[0] ?? null
            : data.tenant ?? null,
    };

    const parsed = membershipWithTenantSchema.safeParse(sanitizedData);

    if (!parsed.success) {
        console.error("Invalid membership payload:", JSON.stringify(parsed.error.flatten(), null, 2));
        return null;
    }

    return parsed.data;
}