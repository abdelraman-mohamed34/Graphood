// src/shared/lib/supabase/services/profile/get-avatar-url.service.ts

import { SupabaseClient } from "@supabase/supabase-js";

interface GetAvatarUrlParams {
    supabase: SupabaseClient;
    path: string | null | undefined;
}

export async function getAvatarUrl({
    supabase,
    path,
}: GetAvatarUrlParams) {
    if (!path) {
        return null;
    }

    if (/^https?:\/\//i.test(path)) {
        return path;
    }

    const { data, error } = await supabase.storage
        .from("avatars")
        .createSignedUrl(path, 60 * 60);

    if (error) {
        return null;
    }

    return data.signedUrl;
}
