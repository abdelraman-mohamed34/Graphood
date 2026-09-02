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

        return { success: true, log };
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Failed to create audit log";
        console.error("Error in createAuditLogAction:", message);
        return { success: false, error: message };
    }
}
