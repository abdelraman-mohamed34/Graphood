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
            pending_readme,
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
            hasPendingReadme: row.pending_readme !== null,
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

export interface SystemReadmeReview {
    id: string;
    name: string;
    ownerId: string;
    ownerName: string;
    liveReadme: string;
    pendingReadme: string | null;
    submittedAt: string | null;
}

export async function getSystemReadmeReviewService(
    supabase: ServerSupabaseClient,
    systemId: string,
): Promise<SystemReadmeReview | null> {
    const { data, error } = await supabase
        .from("systems")
        .select(`id, name, owner_id, readme, pending_readme, pending_readme_submitted_at, owner:profiles!systems_owner_id_fkey(first_name, last_name)`)
        .eq("id", systemId)
        .maybeSingle();

    if (error) throw new Error(`systems.fetchFailed: ${error.message}`);
    if (!data) return null;
    const owner = data.owner as Pick<OwnerRow, "first_name" | "last_name"> | null;
    return {
        id: data.id,
        name: data.name,
        ownerId: data.owner_id,
        ownerName: [owner?.first_name, owner?.last_name].filter(Boolean).join(" "),
        liveReadme: data.readme ?? "",
        pendingReadme: data.pending_readme,
        submittedAt: data.pending_readme_submitted_at,
    };
}

export async function approveSystemReadmeService(
    supabase: ServerSupabaseClient,
    systemId: string,
): Promise<void> {
    const review = await getSystemReadmeReviewService(supabase, systemId);
    if (!review) throw new Error("systems.notFound");
    if (review.pendingReadme === null || review.submittedAt === null) {
        throw new Error("systems.noPendingReadme");
    }

    const { data, error } = await supabase
        .from("systems")
        .update({
            readme: review.pendingReadme,
            pending_readme: null,
            pending_readme_submitted_at: null,
            pending_readme_submitted_by: null,
            updated_at: new Date().toISOString(),
        })
        .eq("id", systemId)
        .eq("pending_readme_submitted_at", review.submittedAt)
        .select("id")
        .maybeSingle();

    if (error) throw new Error(`systems.updateFailed: ${error.message}`);
    if (!data) throw new Error("systems.reviewChanged");
}
