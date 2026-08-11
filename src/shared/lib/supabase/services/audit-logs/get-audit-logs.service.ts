import { SupabaseClient } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "../../server";

interface GetAuditLogsParams {
    limit?: number;
    offset?: number;
    entityType?: string;
    action?: string;
    tenantId?: string | null;
}

export async function getAuditLogs(supabase: SupabaseClient, {
    limit = 20,
    offset = 0,
    entityType,
    action,
    tenantId,
}: GetAuditLogsParams = {}) {

    let query = supabase
        .from("audit_logs")
        .select(`
      *,
      actor:profiles!actor_id (
        id,
        first_name,
      last_name,
        email,
        avatar_url
      )
    `, { count: "exact" })
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

    if (tenantId !== undefined) {
        if (tenantId === null) {
            query = query.is("tenant_id", null);
        } else {
            query = query.eq("tenant_id", tenantId);
        }
    }

    if (entityType) {
        query = query.eq("entity_type", entityType);
    }

    if (action) {
        query = query.eq("action", action);
    }

    const { data, count, error } = await query;

    if (error) {
        throw new Error(`Failed to fetch audit logs: ${error.message}`);
    }

    return { logs: data, total: count };
}