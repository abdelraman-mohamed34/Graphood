import { CreateAuditLogInput } from "@/shared/lib/schemas";
import { createSupabaseServerClient } from "../../server";

export async function createAuditLog(payload: CreateAuditLogInput) {
    const supabase = await createSupabaseServerClient();

    let actorId = payload.actor_id;

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
                action: payload.action,
                entity_type: payload.entity_type,
                entity_id: payload.entity_id,
                metadata: payload.metadata ?? {},
                ip_address: payload.ip_address,
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