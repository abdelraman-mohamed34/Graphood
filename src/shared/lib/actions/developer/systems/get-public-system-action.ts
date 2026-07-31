import { fetchUser } from "@/shared/lib/supabase/services/auth/user/fetch-user.service";
import { getSystemById } from "@/shared/lib/supabase/services/systems";
import { SupabaseClient } from "@supabase/supabase-js";


export async function getPublicSystemAction(
    id: string,
    supabase: SupabaseClient
) {
    const user = await fetchUser(supabase)
    if (!user) {
        throw new Error("system error: required user")
    }
    const system = await getSystemById(id, supabase)

    if (!system) {
        throw new Error("system error: System not found")
    }

    return system
}