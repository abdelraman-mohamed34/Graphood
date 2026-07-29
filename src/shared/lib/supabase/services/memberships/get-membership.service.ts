// src/shared/lib/supabase/services/memberships/get-membership.service.ts

import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import { membershipSchema } from "@/shared/lib/schemas/memberships.schema";
import { tenantSchema } from "@/shared/lib/schemas/tenants.schema";

interface GetMembershipParams {
    userId: string;
    tenantSlug: string;
    supabase: SupabaseClient;
}

const membershipWithTenantSchema = membershipSchema.extend({
    tenant: tenantSchema.nullable().optional(),
});

export type MembershipWithTenant = z.infer<
    typeof membershipWithTenantSchema
>;

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
            tenant:tenants!inner(*)
        `)
        .eq("profile_id", userId)
        .eq("tenants.slug", tenantSlug)
        .maybeSingle();

    if (error) {
        console.error("[Membership] Supabase Error:", error);
        throw error;
    }

    if (!data) {
        console.warn("[Membership] Membership not found.", {
            userId,
            tenantSlug,
        });

        return null;
    }

    const sanitizedData = {
        ...data,
        permissions: data.permissions ?? [],
        tenant: Array.isArray(data.tenant)
            ? data.tenant[0] ?? null
            : data.tenant ?? null,
    };

    const parsed =
        membershipWithTenantSchema.safeParse(sanitizedData);

    if (!parsed.success) {
        console.error(
            "[Membership] Zod validation failed."
        );

        console.error(
            "Validation Errors:",
            parsed.error.flatten()
        );

        throw new Error(
            "Membership validation failed. Check server logs for details."
        );
    }

    return parsed.data;
}