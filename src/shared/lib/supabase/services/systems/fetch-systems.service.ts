import { System } from "@/shared/lib/schemas/systems.schema";
import { SupabaseClient } from "@supabase/supabase-js";

export async function getPublicSystemsClient(supabase: SupabaseClient): Promise<System[]> {

    const { data, error } = await supabase
        .from("systems")
        .select("id, name, slug, description, currency, status, icon_url, image_url, starter_price, pro_price, business_price, reseller_price, exclusive_price, tags")
        .eq("is_public", true)
        .eq("status", "ACTIVE")
        .order("created_at", { ascending: false });

    if (error) {
        throw error;
    }

    return data as System[];
}
