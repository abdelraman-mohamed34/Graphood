import { System } from "@/shared/lib/schemas/systems.schema";
import { SupabaseClient } from "@supabase/supabase-js";

export async function getCurrentSystems(userID: string, supabase: SupabaseClient): Promise<System[]> {

    const { data, error } = await supabase
        .from("systems")
        .select("*")
        .eq("owner_id", userID)
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error fetching systems on client service:", error);
        throw error;
    }

    return data as System[];
}