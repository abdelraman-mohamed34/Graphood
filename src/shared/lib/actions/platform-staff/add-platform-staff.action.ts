"use server";

import type {
    CreatePlatformStaffInput,
    PlatformStaff,
} from "@/shared/lib/schemas/graphood-staff.schema";
import { createPlatformStaffSchema } from "@/shared/lib/schemas/graphood-staff.schema";
import { addPlatformStaffService } from "@/shared/lib/supabase/services/platform-staff";
import { authorizeSuperAdmin } from "./authorize-super-admin";
import { createAuditLog } from "../../supabase/services/audit-logs";

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
        return {
            success: false,
            error: parsed.error.issues[0]?.message ?? "validation.invalidInput",
        };
    }

    try {
        const { supabase, user } = await authorizeSuperAdmin();
        const data = await addPlatformStaffService({ supabase, payload: parsed.data });

        await createAuditLog(supabase, {
            actor_id: user.id,
            action: "STAFF_INVITED",
            entity_type: "platform_staff",
            entity_id: data.id,
            tenant_id: null,
            metadata: {
                email: data.email,
                role: data.role,
                profile_id: data.profileId,
            },
        });

        return { success: true, data };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "staff.addFailed",
        };
    }
}
