import { PlatformStaff } from "@/shared/lib/schemas/graphood-staff.schema";
import { SupabaseClient } from "@supabase/supabase-js";

interface FetchPlatformStaffParams {
    supabase: SupabaseClient;
}

export async function fetchPlatformStaffService({
    supabase,
}: FetchPlatformStaffParams): Promise<PlatformStaff[]> {
    const { data, error } = await supabase
        .from("platform_staff")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) {
        throw error;
    }

    return data as PlatformStaff[];
}