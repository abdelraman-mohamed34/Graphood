"use server";

import type {
    CreatePlatformStaffInput,
    PlatformStaff,
} from "@/shared/lib/schemas/graphood-staff.schema";
import { createPlatformStaffSchema } from "@/shared/lib/schemas/graphood-staff.schema";
import { addPlatformStaffService } from "@/shared/lib/supabase/services/platform-staff";
import { authorizeSuperAdmin } from "./authorize-super-admin";

export type PlatformStaffActionResult<T> = {
    success: boolean;
    data?: T;
    error?: string;
};

export async function addPlatformStaffAction(
    input: CreatePlatformStaffInput,
): Promise<PlatformStaffActionResult<PlatformStaff>> {
    const parsed = createPlatformStaffSchema.safeParse(input);
    if (!parsed.success) {
        return { success: false, error: parsed.error.issues[0]?.message ?? "validation.invalidInput" };
    }

    try {
        const { supabase } = await authorizeSuperAdmin();
        const data = await addPlatformStaffService({ supabase, payload: parsed.data });
        return { success: true, data };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "staff.addFailed",
        };
    }
}
