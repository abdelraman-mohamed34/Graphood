"use server";

import { getAuditLogs } from "@/shared/lib/supabase/services/audit-logs";
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

        return {
            success: true,
            logs: logs ?? [],
            total: total ?? 0,
        };
    } catch (error: any) {
        console.error("Error in getAuditLogsAction:", error?.message || error);
        return {
            success: false,
            error: error?.message || "Failed to fetch audit logs",
            logs: [],
            total: 0,
        };
    }
}