import { createSupabaseServerClient } from "@/shared/lib/supabase/server";

export async function updateApiKeyLastUsed(
    id: string
): Promise<void> {

    const supabase = await createSupabaseServerClient();

    const { error } = await supabase
        .from("developer_api_keys")
        .update({
            last_used_at: new Date(),
        })
        .eq("id", id);

    if (error) {
        console.error("Error updating API key last used:", error);
        throw error;
    }
}