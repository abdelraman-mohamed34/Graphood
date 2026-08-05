import { createAdminClient } from "@/shared/lib/supabase/admin";

export async function updateApiKeyLastUsed(
    id: string
): Promise<void> {

    const supabase = createAdminClient();

    const { error } = await supabase
        .from("developer_api_keys")
        .update({
            last_used_at: new Date().toISOString(),
        })
        .eq("id", id);

    if (error) {
        throw error;
    }
}
