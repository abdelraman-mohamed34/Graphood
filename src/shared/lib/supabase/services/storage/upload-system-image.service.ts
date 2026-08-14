import type { SupabaseClient } from "@supabase/supabase-js";

export const SYSTEM_IMAGE_MAX_BYTES = 5 * 1024 * 1024;
export const SYSTEM_IMAGE_MIME_TYPES = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/avif",
] as const;

export type SystemImageUploadError = "invalidType" | "tooLarge" | "unauthenticated" | "uploadFailed";

export async function uploadSystemImage(supabase: SupabaseClient, file: File): Promise<string> {
    if (!SYSTEM_IMAGE_MIME_TYPES.includes(file.type as (typeof SYSTEM_IMAGE_MIME_TYPES)[number])) {
        throw new Error("invalidType" satisfies SystemImageUploadError);
    }
    if (file.size > SYSTEM_IMAGE_MAX_BYTES) {
        throw new Error("tooLarge" satisfies SystemImageUploadError);
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("unauthenticated" satisfies SystemImageUploadError);

    const extension = file.name.split(".").pop()?.toLowerCase() ?? file.type.split("/")[1] ?? "webp";
    const path = `${user.id}/${crypto.randomUUID()}.${extension}`;
    const { error } = await supabase.storage.from("system-media").upload(path, file, {
        cacheControl: "31536000",
        contentType: file.type,
        upsert: false,
    });

    if (error) throw new Error("uploadFailed" satisfies SystemImageUploadError);
    return supabase.storage.from("system-media").getPublicUrl(path).data.publicUrl;
}
