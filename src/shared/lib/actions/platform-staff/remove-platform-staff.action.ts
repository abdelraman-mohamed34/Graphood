"use server";

import {
    checkPlatformRoleService,
    removePlatformStaffService,
} from "@/shared/lib/supabase/services/platform-staff";
import { z } from "zod";
import { createClient } from "../../supabase/client";

const removeStaffSchema = z.object({
    staffId: z.string().uuid("Invalid Staff ID"),
});

export async function removePlatformStaffAction(
    staffId: string
): Promise<{ success: boolean; error?: string }> {
    try {
        const parsed = removeStaffSchema.safeParse({ staffId });
        if (!parsed.success) {
            return { success: false, error: "Invalid Staff ID" };
        }

        const supabase = await createClient();

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return { success: false, error: "Unauthorized" };
        }

        const currentRole = await checkPlatformRoleService({
            supabase,
            profileId: user.id,
        });

        if (currentRole !== "SUPER_ADMIN") {
            return { success: false, error: "Forbidden: Super Admin access required" };
        }

        await removePlatformStaffService({
            supabase,
            staffId: parsed.data.staffId,
        });

        return { success: true };
    } catch (error: any) {
        return {
            success: false,
            error: error?.message || "Failed to remove platform staff",
        };
    }
}