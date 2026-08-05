import { DeveloperApiKey } from "@/shared/lib/schemas/developer/api-keys";
import { createSupabaseServerClient } from "@/shared/lib/supabase/server";

export async function getApiKey(
    id: string
): Promise<DeveloperApiKey | null> {

    const supabase = await createSupabaseServerClient();

    const { data: record, error } = await supabase
        .from("developer_api_keys")
        .select("*")
        .eq("id", id)
        .single();

    if (error) {
        throw error;
    }

    return record;
}