// src/shared/lib/supabase/services/profile/remove-avatar.service.ts

import { SupabaseClient } from "@supabase/supabase-js";

interface RemoveAvatarParams {
    supabase: SupabaseClient;
    userId: string;
}

export async function removeAvatar({
    supabase,
    userId,
}: RemoveAvatarParams) {
    const { data: files, error: listError } = await supabase.storage
        .from("avatars")
        .list(userId);

    if (listError) {
        throw new Error(listError.message);
    }

    if (!files.length) {
        return;
    }

    const { error: removeError } = await supabase.storage
        .from("avatars")
        .remove(
            files.map((file) => `${userId}/${file.name}`)
        );

    if (removeError) {
        throw new Error(removeError.message);
    }
}