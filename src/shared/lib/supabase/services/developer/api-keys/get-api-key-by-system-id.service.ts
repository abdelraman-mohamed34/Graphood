import { DeveloperApiKey } from "@/shared/lib/schemas/developer/api-keys";
import { createSupabaseServerClient } from "../../../server";

export async function getApiKeyBySystemId(
    systemId: string
): Promise<DeveloperApiKey[]> {

    const supabase = await createSupabaseServerClient();

    const { data: records, error } = await supabase
        .from("developer_api_keys")
        .select("*")
        .eq("system_id", systemId)
        .order("created_at", {
            ascending: false,
        });

    if (error) {
        throw error;
    }

    return records;
}