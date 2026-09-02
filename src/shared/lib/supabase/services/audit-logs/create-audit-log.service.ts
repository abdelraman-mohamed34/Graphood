import { CreateAuditLogInput } from "@/shared/lib/schemas";
import { SupabaseClient } from "@supabase/supabase-js";
import { headers } from "next/headers";

async function getClientIpAddress() {
    const requestHeaders = await headers();
    const forwardedFor = requestHeaders.get("x-forwarded-for");

    return forwardedFor?.split(",")[0]?.trim()
        || requestHeaders.get("x-real-ip")?.trim()
        || null;
}

export async function createAuditLog(supabase: SupabaseClient, payload: CreateAuditLogInput) {
    let actorId = payload.actor_id;
    const ipAddress = payload.ip_address ?? await getClientIpAddress();

    if (!actorId) {
        const {
            data: { user },
        } = await supabase.auth.getUser();
        actorId = user?.id ?? null;
    }

    const { data, error } = await supabase
        .from("audit_logs")
        .insert([
            {
                actor_id: actorId,
                tenant_id: payload.tenant_id ?? null,
                action: payload.action,
                entity_type: payload.entity_type,
                entity_id: payload.entity_id,
                metadata: payload.metadata ?? {},
                ip_address: ipAddress,
            },
        ])
        .select()
        .single();

    if (error) {
        console.error("Audit Log Creation Error:", error.message);
        return null;
    }

    return data;
}
