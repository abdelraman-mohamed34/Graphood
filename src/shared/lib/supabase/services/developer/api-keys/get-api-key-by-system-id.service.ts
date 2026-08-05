import { DeveloperApiKey } from "@/shared/lib/schemas/developer/api-keys";
import { createSupabaseServerClient } from "../../../server";

export async function getApiKeyBySystemId(
    systemId: string
): Promise<Array<Pick<DeveloperApiKey, "id" | "system_id" | "encrypted_key" | "name" | "is_active" | "last_used_at" | "expires_at" | "created_at" | "updated_at">>> {

    const supabase = await createSupabaseServerClient();

    const { data: records, error } = await supabase
        .from("developer_api_keys")
        .select("id, system_id, encrypted_key, name, is_active, last_used_at, expires_at, created_at, updated_at")
        .eq("system_id", systemId)
        .order("created_at", {
            ascending: false,
        });

    if (error) {
        throw error;
    }

    return records;
}
