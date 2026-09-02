"use server";

import {
    CreateClientAuditLogInput,
    createClientAuditLogSchema,
} from "../../schemas";
import { createAuditLog } from "@/shared/lib/supabase/services/audit-logs";
import { requireUser } from "../../auth/requires/require-user";

export async function createAuditLogAction(
    input: CreateClientAuditLogInput,
    locale: string,
) {
    try {
        const { user, supabase } = await requireUser(locale);
        const validatedData = createClientAuditLogSchema.parse(input);

        const log = await createAuditLog(supabase, {
            ...validatedData,
            actor_id: user.id,
            tenant_id: null,
        });

        if (!log) return { success: false, error: "auditLogs.createFailed" };
        return { success: true, log };
    } catch (error: unknown) {
        console.error("Error in createAuditLogAction:", error);
        return { success: false, error: "auditLogs.createFailed" };
    }
}
