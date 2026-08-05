// src/shared/lib/actions/profile/update-profile.action.ts
"use server";

import { z } from "zod";

import { requireUser } from "@/shared/lib/auth/requires/require-user";

import { updateProfile } from "@/shared/lib/supabase/services/profile/update-profile.service";
import { updateProfileSchema } from "../../schemas/inputs/profile-inputs.schema";

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

type UpdateProfileResult =
    | {
        success: true;
    }
    | {
        success: false;
        code:
        | "INVALID_INPUT"
        | "UNAUTHORIZED"
        | "UPDATE_FAILED"
        | "UNKNOWN_ERROR";
    };

export async function updateProfileAction(
    locale: string,
    input: UpdateProfileInput
): Promise<UpdateProfileResult> {
    try {
        const parsed = updateProfileSchema.safeParse(input);

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

        await updateProfile({
            supabase,
            profileId: user.id,
            data: parsed.data,
        });

        return {
            success: true,
        };
    } catch {

        return {
            success: false,
            code: "UPDATE_FAILED",
        };
    }
}
