import { SupabaseClient } from "@supabase/supabase-js";

export async function fetchProfile(supabase: SupabaseClient, userId: string) {

    const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

    if (error) return null;
    return data;
}