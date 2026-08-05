// src/shared/lib/actions/profile/upload-avatar.action.ts

"use server";

import { z } from "zod";

import { requireUser } from "@/shared/lib/auth/requires/require-user";

import { uploadAvatar } from "@/shared/lib/supabase/services/profile/upload-avatar.service";
import { updateProfile } from "@/shared/lib/supabase/services/profile/update-profile.service";

const uploadAvatarSchema = z.object({
    locale: z.string().min(2),
    file: z.instanceof(File),
});

type UploadAvatarResult =
    | {
        success: true;
        path: string;
    }
    | {
        success: false;
        code:
        | "INVALID_INPUT"
        | "UNAUTHORIZED"
        | "UPLOAD_FAILED"
        | "UNKNOWN_ERROR";
    };

export async function uploadAvatarAction(
    locale: string,
    file: File
): Promise<UploadAvatarResult> {
    try {
        const parsed = uploadAvatarSchema.safeParse({
            locale,
            file,
        });

        if (!parsed.success) {
            return {
                success: false,
                code: "INVALID_INPUT",
            };
        }

        const {
            user,
            supabase,
        } = await requireUser(locale);

        const { path } = await uploadAvatar({
            supabase,
            userId: user.id,
            file,
        });

        await updateProfile({
            supabase,
            profileId: user.id,
            data: {
                avatar_url: path,
            },
        });

        return {
            success: true,
            path,
        };
    } catch {

        return {
            success: false,
            code: "UPLOAD_FAILED",
        };
    }
}