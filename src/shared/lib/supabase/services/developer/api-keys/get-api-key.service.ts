import { DeveloperApiKey } from "@/shared/lib/schemas/developer/api-keys";
import { createSupabaseServerClient } from "@/shared/lib/supabase/server";

export async function getApiKey(
    id: string
): Promise<Pick<DeveloperApiKey, "id" | "system_id" | "name" | "is_active" | "expires_at"> | null> {

    const supabase = await createSupabaseServerClient();

    const { data: record, error } = await supabase
        .from("developer_api_keys")
        .select("id, system_id, name, is_active, expires_at")
        .eq("id", id)
        .maybeSingle();

    if (error) {
        throw error;
    }

    return record;
}
