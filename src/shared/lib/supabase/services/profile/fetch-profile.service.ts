import { Profile } from "@/shared/lib/schemas/profiles.schema";
import { SupabaseClient } from "@supabase/supabase-js";

export async function fetchProfile(
    supabase: SupabaseClient,
    userId: string
): Promise<Profile | null> {
    const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

    if (error) {
        return null;
    }

    return data as Profile;
}