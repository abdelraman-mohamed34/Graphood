import { createSupabaseServerClient } from "@/shared/lib/supabase/server";

export async function deleteApiKey(
    id: string
): Promise<void> {
    const supabase = await createSupabaseServerClient();

    const { error } = await supabase
        .from("developer_api_keys")
        .delete()
        .eq("id", id);

    if (error) {
        throw error;
    }
}