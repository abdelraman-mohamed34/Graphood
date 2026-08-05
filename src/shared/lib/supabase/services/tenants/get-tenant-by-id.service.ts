import { SupabaseClient } from "@supabase/supabase-js";

export async function getTenantById(
    tenantId: string,
    supabase: SupabaseClient
) {
    const { data: tenant, error } = await supabase
        .from("tenants")
        .select("id, system_id, owner_id, subscription_id, name, slug, subdomain, status, logo_url, primary_color, email, phone, country, city, address, timezone, created_at, updated_at")
        .eq("id", tenantId)
        .maybeSingle();

    if (error) {

        throw error;
    }

    return tenant;
}
