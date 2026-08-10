import { SupabaseClient } from "@supabase/supabase-js";


export async function getSystemById(
    id: string,
    supabase: SupabaseClient
) {

    const { data, error } = await supabase
        .from("systems")
        .select("id, name, slug, description, owner_id, currency, status, status_reason, category, icon_url, is_public, starter_price, pro_price, business_price, reseller_price, exclusive_price, tags, created_at, updated_at")
        .eq("id", id)
        .single();

    if (error) {
        if (error.code === "PGRST116") {
            return null;
        }
        throw error;
    }


    return data;
}
