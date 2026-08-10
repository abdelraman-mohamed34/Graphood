import { Profile } from "@/shared/lib/schemas/profiles.schema";
import { SupabaseClient } from "@supabase/supabase-js";

export async function fetchProfile(
    supabase: SupabaseClient,
    userId: string
): Promise<Profile | null> {
    const { data, error } = await supabase
        .from("profiles")
        .select("id, first_name, last_name, email, phone, avatar_url, country, city, preferred_language, is_verified, sex, created_at, updated_at")
        .eq("id", userId)
        .single();

    if (error) {
        return null;
    }

    return data as Profile;
}