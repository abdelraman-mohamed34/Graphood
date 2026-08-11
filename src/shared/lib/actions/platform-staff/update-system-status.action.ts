"use server";

import { updateSystemStatusService } from "@/shared/lib/supabase/services/platform-staff";
import { z } from "zod";
import type { PlatformStaffActionResult } from "./add-platform-staff.action";
import { authorizeSuperAdmin } from "./authorize-super-admin";
import { createAuditLog } from "../../supabase/services/audit-logs";

const updateSystemStatusSchema = z.object({
    systemId: z.string().uuid({ message: "validation.systemIdInvalid" }),
    status: z.enum(["ACTIVE", "REJECTED", "PENDING", "SUSPENDED"]),
});

export type UpdateSystemStatusInput = z.infer<typeof updateSystemStatusSchema>;

export async function updateSystemStatusAction(
    input: UpdateSystemStatusInput,
): Promise<PlatformStaffActionResult<{ systemId: string }>> {
    const parsed = updateSystemStatusSchema.safeParse(input);
    if (!parsed.success) {
        return { success: false, error: parsed.error.issues[0]?.message ?? "validation.invalidInput" };
    }

    try {
        const { supabase, user } = await authorizeSuperAdmin();
        await updateSystemStatusService({
            supabase,
            systemId: parsed.data.systemId,
            status: parsed.data.status,
        });

        await createAuditLog(supabase, {
            actor_id: user.id,
            action: `SYSTEM_STATUS_${parsed.data.status}`,
            entity_type: "system",
            entity_id: parsed.data.systemId,
            tenant_id: null,
            metadata: {
                new_status: parsed.data.status,
            },
        });

        return { success: true, data: { systemId: parsed.data.systemId } };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "errors.unknown",
        };
    }
}