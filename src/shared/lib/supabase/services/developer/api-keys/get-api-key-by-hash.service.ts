import { DeveloperApiKey } from "@/shared/lib/schemas/developer/api-keys";
import { createAdminClient } from "@/shared/lib/supabase/admin";

export async function getApiKeyByHash(
    hash: string
): Promise<DeveloperApiKey | null> {

    const supabase = await createAdminClient();

    const { data: record, error } = await supabase
        .from("developer_api_keys")
        .select("*")
        .eq("key_hash", hash)
        .single();

    if (error) {
        if (error.code === "PGRST116") {
            return null;
        }

        console.error("Error fetching API key by hash:", error);
        throw error;
    }

    return record;
}