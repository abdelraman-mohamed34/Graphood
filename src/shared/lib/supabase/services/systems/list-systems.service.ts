import { SupabaseClient } from "@supabase/supabase-js";

export async function listSystems(
    supabase: SupabaseClient,
    ownerId: string
) {
    const { data, error } = await supabase
        .from("systems")
        .select("*")
        .eq("owner_id", ownerId)
        .order("created_at", { ascending: false });

    if (error) {
        throw error;
    }

    return data;
}