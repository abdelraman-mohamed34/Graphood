"use server";

import type { SystemRole } from "@/shared/lib/schemas/graphood-staff.schema";
import { createSupabaseServerClient } from "@/shared/lib/supabase/server";
import { checkPlatformRoleService } from "@/shared/lib/supabase/services/platform-staff";
import type { PlatformStaffActionResult } from "./add-platform-staff.action";
import { requireUser } from "../../auth/requires/require-user";

export async function checkPlatformRoleAction(): Promise<
    PlatformStaffActionResult<SystemRole | null>
> {
    try {
        const { supabase, user } = await requireUser();

        const data = await checkPlatformRoleService({ supabase, profileId: user.id });
        return { success: true, data };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "staff.roleLookupFailed",
        };
    }
}
