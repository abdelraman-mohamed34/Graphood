"use server";

import { checkPlatformRoleService } from "@/shared/lib/supabase/services/platform-staff";
import { createClient } from "../../supabase/client";
import { SystemRole } from "../../schemas/public/role-permissions";

export async function checkPlatformRoleAction(): Promise<{
    success: boolean;
    role: SystemRole | null;
    error?: string;
}> {
    try {
        const supabase = await createClient();

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return { success: false, role: null, error: "Unauthorized" };
        }

        const role = await checkPlatformRoleService({
            supabase,
            profileId: user.id,
        });

        return { success: true, role };
    } catch (error: any) {
        return {
            success: false,
            role: null,
            error: error?.message || "Failed to check platform role",
        };
    }
}