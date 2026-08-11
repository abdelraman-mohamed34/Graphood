"use server";

import { getAuditLogs, getAuditLogReadState } from "@/shared/lib/supabase/services/audit-logs";
import { requireUser } from "../../auth/requires/require-user";

interface GetAuditLogsInput {
    limit?: number;
    offset?: number;
    entityType?: string;
    action?: string;
    tenantId?: string | null;
}

export async function getAuditLogsAction(
    params: GetAuditLogsInput = {},
    locale: string
) {
    try {
        const { user, supabase } = await requireUser(locale);

        if (!user) {
            return {
                success: false,
                error: "Unauthorized access",
                logs: [],
                total: 0,
            };
        }

        const { logs, total } = await getAuditLogs(supabase, params);
        const lastViewedAt = await getAuditLogReadState(supabase, user.id);
        const lastViewedTime = lastViewedAt ? new Date(lastViewedAt).getTime() : 0;

        return {
            success: true,
            logs: (logs ?? []).map((log) => ({
                ...log,
                is_read: new Date(log.created_at ?? 0).getTime() <= lastViewedTime,
            })),
            total: total ?? 0,
        };
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Failed to fetch audit logs";
        console.error("Error in getAuditLogsAction:", message);
        return {
            success: false,
            error: message,
            logs: [],
            total: 0,
        };
    }
}
