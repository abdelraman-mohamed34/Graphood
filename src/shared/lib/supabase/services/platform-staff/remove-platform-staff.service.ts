import type { SupabaseClient } from "@supabase/supabase-js";

export async function removePlatformStaffService({
    supabase,
    staffId,
}: {
    supabase: SupabaseClient;
    staffId: string;
}): Promise<{ id: string }> {
    const { data, error } = await supabase
        .from("platform_staff")
        .delete()
        .eq("id", staffId)
        .select("id")
        .maybeSingle();

    if (error) {
        throw new Error(`staff.removeFailed: ${error.message}`);
    }
    if (!data) {
        throw new Error("staff.notFound");
    }

    return data;
}
