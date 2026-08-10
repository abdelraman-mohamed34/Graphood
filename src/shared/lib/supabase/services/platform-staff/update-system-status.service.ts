import { SupabaseClient } from "@supabase/supabase-js";

interface UpdateSystemStatusParams {
    supabase: SupabaseClient;
    systemId: string;
    status: "ACTIVE" | "REJECTED" | "PENDING" | "SUSPENDED";
}

export async function updateSystemStatusService({
    supabase,
    systemId,
    status,
}: UpdateSystemStatusParams): Promise<void> {
    const { error } = await supabase
        .from("systems")
        .update({ status })
        .eq("id", systemId);

    if (error) {
        throw error;
    }
}