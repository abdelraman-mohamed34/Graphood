import { SupabaseClient } from "@supabase/supabase-js";


export async function getSystemById(
    id: string,
    supabase: SupabaseClient
) {

    const { data, error } = await supabase
        .from("systems")
        .select()
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