import { createAdminClient } from "@/shared/lib/supabase/admin";

export async function getApiKeyByHash(
    hash: string
) {

    const supabase = await createAdminClient();

    const { data: record, error } = await supabase
        .from("developer_api_keys")
        .select("id, system_id, name, is_active, expires_at")
        .eq("key_hash", hash)
        .single();

    if (error) {
        if (error.code === "PGRST116") {
            return null;
        }

        throw error;
    }

    return record;
}
