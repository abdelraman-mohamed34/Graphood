import { SupabaseClient } from "@supabase/supabase-js";

export async function listSystems(
    supabase: SupabaseClient,
    ownerId: string
) {
    const { data, error } = await supabase
        .from("systems")
        .select("id, name, slug, description, owner_id, currency, status, status_reason, icon_url, image_url, is_public, starter_price, pro_price, business_price, reseller_price, exclusive_price, tags, created_at, updated_at")
        .eq("owner_id", ownerId)
        .order("created_at", { ascending: false });

    if (error) {
        throw error;
    }

    return data;
}
