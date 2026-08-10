"use server";

import { removePlatformStaffSchema } from "@/shared/lib/schemas/graphood-staff.schema";
import { removePlatformStaffService } from "@/shared/lib/supabase/services/platform-staff";
import type { PlatformStaffActionResult } from "./add-platform-staff.action";
import { authorizeSuperAdmin } from "./authorize-super-admin";

export async function removePlatformStaffAction(
    staffId: string,
): Promise<PlatformStaffActionResult<{ id: string }>> {
    const parsed = removePlatformStaffSchema.safeParse({ staffId });
    if (!parsed.success) {
        return { success: false, error: parsed.error.issues[0]?.message ?? "validation.staffIdInvalid" };
    }

    try {
        const { supabase, user } = await authorizeSuperAdmin();
        const { data: target, error: lookupError } = await supabase
            .from("platform_staff")
            .select("profile_id")
            .eq("id", parsed.data.staffId)
            .maybeSingle();

        if (lookupError) throw new Error(`staff.lookupFailed: ${lookupError.message}`);
        if (!target) throw new Error("staff.notFound");
        if (target.profile_id === user.id) throw new Error("staff.cannotRemoveSelf");

        const data = await removePlatformStaffService({
            supabase,
            staffId: parsed.data.staffId,
        });
        return { success: true, data };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "staff.removeFailed",
        };
    }
}
