import type { SupabaseClient } from "@supabase/supabase-js";

export async function getAuditLogReadState(
    supabase: SupabaseClient,
    profileId: string,
) {
    const { data, error } = await supabase
        .from("platform_staff")
        .select("audit_logs_last_viewed_at")
        .eq("profile_id", profileId)
        .single();

    if (error) throw new Error(`auditLogs.readStateFailed: ${error.message}`);
    return data.audit_logs_last_viewed_at as string | null;
}

export async function countUnreadAuditLogs(
    supabase: SupabaseClient,
    lastViewedAt: string | null,
) {
    let query = supabase
        .from("audit_logs")
        .select("id", { count: "exact", head: true })
        .is("tenant_id", null);

    if (lastViewedAt) query = query.gt("created_at", lastViewedAt);

    const { count, error } = await query;
    if (error) throw new Error(`auditLogs.unreadCountFailed: ${error.message}`);
    return count ?? 0;
}

export async function markAuditLogsRead(
    supabase: SupabaseClient,
    profileId: string,
) {
    const readAt = new Date().toISOString();
    const { error } = await supabase
        .from("platform_staff")
        .update({ audit_logs_last_viewed_at: readAt })
        .eq("profile_id", profileId);

    if (error) throw new Error(`auditLogs.markReadFailed: ${error.message}`);
    return readAt;
}
