// src/shared/lib/supabase/services/profile/upload-avatar.service.ts

import { SupabaseClient } from "@supabase/supabase-js";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ALLOWED_MIME_TYPES = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/avif",
] as const;

interface UploadAvatarParams {
    supabase: SupabaseClient;
    userId: string;
    file: File;
}

export async function uploadAvatar({
    supabase,
    userId,
    file,
}: UploadAvatarParams) {
    if (!(file instanceof File)) {
        throw new Error("Invalid file.");
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type as (typeof ALLOWED_MIME_TYPES)[number])) {
        throw new Error(
            "Only JPG, PNG, WEBP and AVIF images are allowed."
        );
    }

    if (file.size > MAX_FILE_SIZE) {
        throw new Error("Avatar size must not exceed 5 MB.");
    }

    const extension =
        file.name.split(".").pop()?.toLowerCase() ??
        file.type.split("/")[1] ??
        "webp";

    const path = `${userId}/avatar.${extension}`;

    const { data: existingFiles, error: listError } = await supabase.storage
        .from("avatars")
        .list(userId);

    if (listError) {
        throw new Error(listError.message);
    }

    if (existingFiles.length) {
        const { error: removeError } = await supabase.storage
            .from("avatars")
            .remove(
                existingFiles.map(
                    ({ name }) => `${userId}/${name}`
                )
            );

        if (removeError) {
            throw new Error(removeError.message);
        }
    }

    const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(path, file, {
            upsert: true,
            contentType: file.type,
        });

    if (uploadError) {
        throw new Error(uploadError.message);
    }

    return {
        path,
    };
}