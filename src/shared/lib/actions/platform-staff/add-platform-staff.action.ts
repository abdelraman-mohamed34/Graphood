"use server";

import {
    addPlatformStaffService,
    checkPlatformRoleService,
} from "@/shared/lib/supabase/services/platform-staff";
import { CreatePlatformStaffInput, createPlatformStaffSchema, PlatformStaff } from "../../schemas/graphood-staff.schema";
import { createClient } from "../../supabase/client";


export async function addPlatformStaffAction(
    input: CreatePlatformStaffInput
): Promise<{
    success: boolean;
    data?: PlatformStaff;
    error?: string;
}> {
    try {
        const parsed = createPlatformStaffSchema.safeParse(input);
        if (!parsed.success) {
            return {
                success: false,
                error: parsed.error.issues[0]?.message || "Invalid input data",
            };
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

        const staff = await addPlatformStaffService({
            supabase,
            payload: parsed.data,
        });

        return { success: true, data: staff };
    } catch (error: any) {
        return {
            success: false,
            error: error?.message || "Failed to add platform staff",
        };
    }
}