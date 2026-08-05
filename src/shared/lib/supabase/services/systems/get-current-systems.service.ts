import { System } from "@/shared/lib/schemas/systems.schema";
import { SupabaseClient } from "@supabase/supabase-js";

export async function getCurrentSystems(userID: string, supabase: SupabaseClient): Promise<System[]> {

    const { data, error } = await supabase
        .from("systems")
        .select("id, name, slug, description, owner_id, currency, status, icon_url, is_public, starter_price, pro_price, business_price, reseller_price, exclusive_price, tags, created_at, updated_at")
        .eq("owner_id", userID)
        .order("created_at", { ascending: false });

    if (error) {
        throw error;
    }

    return data as System[];
}
