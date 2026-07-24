import { SupabaseClient } from "@supabase/supabase-js";

export async function fetchUser(supabase: SupabaseClient) {
    const {
        data: { user },
        error,
    } = await supabase.auth.getUser();

    if (error) {
        if (error.name === "AuthSessionMissingError") {
            return null;
        }

        throw error;
    }

    return user;
}