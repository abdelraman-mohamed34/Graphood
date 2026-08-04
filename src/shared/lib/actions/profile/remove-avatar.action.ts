// src/shared/lib/actions/profile/remove-avatar.action.ts

"use server";

import { z } from "zod";

import { requireUser } from "@/shared/lib/auth/requires/require-user";

import { removeAvatar } from "@/shared/lib/supabase/services/profile/remove-avatar.service";
import { updateProfile } from "@/shared/lib/supabase/services/profile/update-profile.service";

const removeAvatarSchema = z.object({
    locale: z.string().min(2),
});

type RemoveAvatarResult =
    | {
        success: true;
    }
    | {
        success: false;
        code:
        | "INVALID_INPUT"
        | "UNAUTHORIZED"
        | "REMOVE_FAILED"
        | "UNKNOWN_ERROR";
    };

export async function removeAvatarAction(
    locale: string
): Promise<RemoveAvatarResult> {
    try {
        const parsed = removeAvatarSchema.safeParse({
            locale,
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

        await removeAvatar({
            supabase,
            userId: user.id,
        });

        await updateProfile({
            supabase,
            profileId: user.id,
            data: {
                avatar_url: null,
            },
        });

        return {
            success: true,
        };
    } catch (error) {
        console.error(error);

        return {
            success: false,
            code: "REMOVE_FAILED",
        };
    }
}