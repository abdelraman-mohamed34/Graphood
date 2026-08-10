import { SupabaseClient } from "@supabase/supabase-js";

interface RemovePlatformStaffParams {
    supabase: SupabaseClient;
    staffId: string;
}

export async function removePlatformStaffService({
    supabase,
    staffId,
}: RemovePlatformStaffParams): Promise<void> {
    const { error } = await supabase
        .from("platform_staff")
        .delete()
        .eq("id", staffId);

    if (error) {
        throw error;
    }
}