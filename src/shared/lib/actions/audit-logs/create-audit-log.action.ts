"use server";

import { CreateAuditLogInput, createAuditLogSchema } from "../../schemas";
import { createAuditLog } from "@/shared/lib/supabase/services/audit-logs";
import { requireUser } from "../../auth/requires/require-user";

export async function createAuditLogAction(input: CreateAuditLogInput, locale: string) {
    try {
        const { user } = await requireUser(locale)
        const validatedData = createAuditLogSchema.parse(input);

        const log = await createAuditLog({
            ...validatedData,
            actor_id: validatedData.actor_id || user.id,
        });

        return { success: true, log };
    } catch (error: any) {
        console.error("Error in createAuditLogAction:", error?.message || error);
        return { success: false, error: error?.message || "Failed to create audit log" };
    }
}