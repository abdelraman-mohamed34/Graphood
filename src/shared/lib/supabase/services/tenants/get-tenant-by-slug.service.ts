import type { SupabaseClient } from "@supabase/supabase-js";

export async function getTenantBySlug(
    supabase: SupabaseClient,
    slug: string,
) {
    const { data: tenant, error } = await supabase
        .from("tenants")
        .select("id, system_id, owner_id, subscription_id, name, slug, subdomain, status, logo_url, primary_color, email, phone, country, city, address, timezone, created_at, updated_at")
        .eq("slug", slug)
        .single();

    if (error) {
        if (error.code === "PGRST116") {
            return null;
        }

        throw error;
    }

    return tenant;
}
