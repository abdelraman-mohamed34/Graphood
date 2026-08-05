// src/shared/lib/supabase/services/profile/update-profile.service.ts

import { Profile } from "@/shared/lib/schemas/profiles.schema";
import { SupabaseClient } from "@supabase/supabase-js";

interface UpdateProfileParams {
    supabase: SupabaseClient;
    profileId: string;
    data: Partial<
        Pick<
            Profile,
            | "first_name"
            | "last_name"
            | "phone"
            | "avatar_url"
            | "country"
            | "city"
            | "preferred_language"
            | "sex"
        >
    >;
}

export async function updateProfile({
    supabase,
    profileId,
    data,
}: UpdateProfileParams) {
    if (!profileId) {
        throw new Error("Profile ID is required.");
    }

    if (!Object.keys(data).length) {
        throw new Error("No profile data provided.");
    }

    const { data: profile, error } = await supabase
        .from("profiles")
        .update({
            ...data,
            updated_at: new Date().toISOString(),
        })
        .eq("id", profileId)
        .select("id, first_name, last_name, email, phone, avatar_url, country, city, preferred_language, is_verified, sex, created_at, updated_at")
        .single();

    if (error) {
        throw new Error(
            `Failed to update profile: ${error.message}`
        );
    }

    return profile;
}
