"use server";

import { removePlatformStaffSchema } from "@/shared/lib/schemas/graphood-staff.schema";
import { removePlatformStaffService } from "@/shared/lib/supabase/services/platform-staff";
import type { PlatformStaffActionResult } from "./add-platform-staff.action";
import { authorizeSuperAdmin } from "./authorize-super-admin";
import { createAuditLog } from "../../supabase/services/audit-logs";

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

        const { data: targetProfile } = await supabase
            .from("profiles")
            .select("email")
            .eq("id", target.profile_id)
            .maybeSingle();

        const data = await removePlatformStaffService({
            supabase,
            staffId: parsed.data.staffId,
        });

        await createAuditLog(supabase, {
            actor_id: user.id,
            action: "STAFF_REMOVED",
            entity_type: "platform_staff",
            entity_id: data.id,
            tenant_id: null,
            metadata: {
                target_user_email: targetProfile?.email ?? null,
                removed_profile_id: target.profile_id,
            },
        });

        return { success: true, data };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "staff.removeFailed",
        };
    }
}
