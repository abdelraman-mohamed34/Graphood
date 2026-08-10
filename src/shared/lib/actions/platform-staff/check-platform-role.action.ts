"use server";

import type { SystemRole } from "@/shared/lib/schemas/graphood-staff.schema";
import { createSupabaseServerClient } from "@/shared/lib/supabase/server";
import { checkPlatformRoleService } from "@/shared/lib/supabase/services/platform-staff";
import type { PlatformStaffActionResult } from "./add-platform-staff.action";

export async function checkPlatformRoleAction(): Promise<
    PlatformStaffActionResult<SystemRole | null>
> {
    try {
        const supabase = await createSupabaseServerClient();
        const {
            data: { user },
            error,
        } = await supabase.auth.getUser();

        if (error || !user) return { success: false, error: "auth.unauthorized" };

        const data = await checkPlatformRoleService({ supabase, profileId: user.id });
        return { success: true, data };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "staff.roleLookupFailed",
        };
    }
}
