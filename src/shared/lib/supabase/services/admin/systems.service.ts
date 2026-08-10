import "server-only";

import type {
    SystemItem,
    SystemItemStatus,
} from "@/shared/lib/schemas/systems.schema";
import type { Database } from "@/shared/types/database.types";
import type { SupabaseClient } from "@supabase/supabase-js";

type ServerSupabaseClient = SupabaseClient<Database>;

interface OwnerRow {
    id: string;
    email: string | null;
    first_name: string;
    last_name: string;
}

export async function fetchSystemsService(
    supabase: ServerSupabaseClient,
): Promise<SystemItem[]> {
    const { data, error } = await supabase
        .from("systems")
        .select(`
            id,
            name,
            slug,
            owner_id,
            status,
            status_reason,
            created_at,
            owner:profiles!systems_owner_id_fkey(id, email, first_name, last_name)
        `)
        .order("created_at", { ascending: false });

    if (error) throw new Error(`systems.fetchFailed: ${error.message}`);

    return (data ?? []).map((row) => {
        const owner = row.owner as OwnerRow | null;
        return {
            id: row.id,
            name: row.name,
            slug: row.slug,
            ownerId: row.owner_id,
            ownerEmail: owner?.email ?? null,
            ownerName: [owner?.first_name, owner?.last_name].filter(Boolean).join(" "),
            status: (row.status ?? "PENDING") as SystemItemStatus,
            statusReason: row.status_reason,
            createdAt: row.created_at,
        };
    });
}

export async function updateSystemStatusService({
    supabase,
    systemId,
    status,
    reason,
}: {
    supabase: ServerSupabaseClient;
    systemId: string;
    status: "ACTIVE" | "SUSPENDED" | "REJECTED";
    reason?: string;
}): Promise<{ systemId: string; status: typeof status; statusReason?: string }> {
    const updates: Database["public"]["Tables"]["systems"]["Update"] = { status };
    if (reason !== undefined) updates.status_reason = reason;

    const { data, error } = await supabase
        .from("systems")
        .update(updates)
        .eq("id", systemId)
        .select("id, status, status_reason")
        .maybeSingle();

    if (error) throw new Error(`systems.updateFailed: ${error.message}`);
    if (!data) throw new Error("systems.notFound");

    return {
        systemId: data.id,
        status: data.status as typeof status,
        ...(data.status_reason ? { statusReason: data.status_reason } : {}),
    };
}
