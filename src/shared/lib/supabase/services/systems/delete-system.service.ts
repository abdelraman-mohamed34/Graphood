import { SupabaseClient } from "@supabase/supabase-js";


export async function deleteSystem(
    id: string,
    supabase: SupabaseClient
) {

    const { data, error } = await supabase
        .from("systems")
        .delete()
        .eq("id", id)
        .select()
        .single();

    if (error) {

        if (error.code === "PGRST116") {
            return null;
        }

        throw error;
    }


    return data;
}