import { SupabaseClient } from "@supabase/supabase-js";

export async function getUserSystemOrder(
    profileId: string,
    systemId: string,
    supabase: SupabaseClient
) {
    const { data, error } = await supabase
        .from("orders")
        .select("id, status, license_type, plan")
        .eq("profile_id", profileId)
        .eq("system_id", systemId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

    if (error) {
        throw error;
    }

    return data;
}

export async function getPendingUserSystemOrder(
    profileId: string,
    systemId: string,
    supabase: SupabaseClient
) {
    const { data, error } = await supabase
        .from("orders")
        .select("id, status, license_type, plan, created_at")
        .eq("profile_id", profileId)
        .eq("system_id", systemId)
        .eq("status", "PENDING")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

    if (error) throw error;
    return data;
}
