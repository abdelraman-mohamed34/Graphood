"use server";

import type { PlatformStaff } from "@/shared/lib/schemas/graphood-staff.schema";
import { fetchPlatformStaffService } from "@/shared/lib/supabase/services/platform-staff";
import type { PlatformStaffActionResult } from "./add-platform-staff.action";
import { authorizeSuperAdmin } from "./authorize-super-admin";

export async function fetchPlatformStaffAction(): Promise<
    PlatformStaffActionResult<PlatformStaff[]>
> {
    try {
        const { supabase } = await authorizeSuperAdmin();
        const data = await fetchPlatformStaffService({ supabase });
        return { success: true, data };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "staff.fetchFailed",
        };
    }
}
