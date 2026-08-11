"use server";

import { createAdminClient } from "@/shared/lib/supabase/admin";
import { requireUser } from "@/shared/lib/auth/requires/require-user";
import { checkPlatformRoleService } from "@/shared/lib/supabase/services/platform-staff";
import {
    countUnreadAuditLogs,
    getAuditLogReadState,
    markAuditLogsRead,
} from "@/shared/lib/supabase/services/audit-logs";

async function authorizeAuditLogAccess(locale: string) {
    const { user, supabase } = await requireUser(locale);
    const role = await checkPlatformRoleService({ supabase, profileId: user.id });
    if (!role) throw new Error("auth.staffRequired");
    return { user, supabaseAdmin: createAdminClient() };
}

export async function getUnreadAuditLogCountAction(locale: string) {
    try {
        const { user, supabaseAdmin } = await authorizeAuditLogAccess(locale);
        const lastViewedAt = await getAuditLogReadState(supabaseAdmin, user.id);
        const count = await countUnreadAuditLogs(supabaseAdmin, lastViewedAt);
        return { success: true as const, count };
    } catch (error) {
        return {
            success: false as const,
            count: 0,
            error: error instanceof Error ? error.message : "auditLogs.unreadCountFailed",
        };
    }
}

export async function markAuditLogsReadAction(locale: string) {
    try {
        const { user, supabaseAdmin } = await authorizeAuditLogAccess(locale);
        const readAt = await markAuditLogsRead(supabaseAdmin, user.id);
        return { success: true as const, readAt };
    } catch (error) {
        return {
            success: false as const,
            error: error instanceof Error ? error.message : "auditLogs.markReadFailed",
        };
    }
}
