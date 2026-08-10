"use server";

import {
    checkPlatformRoleService,
    updateSystemStatusService,
} from "@/shared/lib/supabase/services/platform-staff";
import { z } from "zod";
import { createClient } from "../../supabase/client";

const updateSystemStatusSchema = z.object({
    systemId: z.string().uuid("Invalid System ID"),
    status: z.enum(["ACTIVE", "REJECTED", "PENDING", "SUSPENDED"]),
});

export type UpdateSystemStatusInput = z.infer<typeof updateSystemStatusSchema>;

export async function updateSystemStatusAction(
    input: UpdateSystemStatusInput
): Promise<{ success: boolean; error?: string }> {
    try {
        const parsed = updateSystemStatusSchema.safeParse(input);
        if (!parsed.success) {
            return {
                success: false,
                error: parsed.error.issues[0]?.message || "Invalid payload",
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
            return {
                success: false,
                error: "Forbidden: Only Super Admins can update system status",
            };
        }

        await updateSystemStatusService({
            supabase,
            systemId: parsed.data.systemId,
            status: parsed.data.status,
        });

        return { success: true };
    } catch (error: any) {
        return {
            success: false,
            error: error?.message || "Failed to update system status",
        };
    }
}