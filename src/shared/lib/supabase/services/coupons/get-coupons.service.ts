import { SupabaseClient } from "@supabase/supabase-js";

interface GetCouponsParams {
    supabase: SupabaseClient;
    systemId: string;
}

export async function getCoupons({
    supabase,
    systemId,
}: GetCouponsParams) {
    const { data, error } = await supabase
        .from("coupons")
        .select("*")
        .eq("system_id", systemId)
        .order("created_at", { ascending: false });

    if (error) {
        throw error;
    }

    return data;
}