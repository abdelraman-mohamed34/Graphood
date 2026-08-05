import { DeveloperApiKeyUpdate } from "@/shared/lib/schemas/developer/api-keys";
import { createSupabaseServerClient } from "@/shared/lib/supabase/server";

export async function updateApiKey(
    id: string,
    data: DeveloperApiKeyUpdate
) {

    const payload = {
        name: data.name,
        is_active: data.is_active,
        expires_at: data.expires_at instanceof Date
            ? data.expires_at.toISOString()
            : data.expires_at,
        updated_at: new Date().toISOString(),
    };

    const supabase = await createSupabaseServerClient();

    const { data: record, error } = await supabase
        .from("developer_api_keys")
        .update(payload)
        .eq("id", id)
        .select("id, system_id, name, is_active, last_used_at, expires_at, created_at, updated_at")
        .single();

    if (error) {
        throw error;
    }

    return record;
}
