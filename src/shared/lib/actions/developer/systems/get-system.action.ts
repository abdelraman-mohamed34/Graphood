import { fetchUser } from "@/shared/lib/supabase/services/auth/user/fetch-user.service";
import { getSystemById } from "@/shared/lib/supabase/services/systems";
import { SupabaseClient } from "@supabase/supabase-js";


export async function getSystemAction(
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

    if (system.owner_id !== user.id) {
        throw new Error("system error: You don't have permissions to do this action")
    }

    return await getSystemById(
        id,
        supabase
    );
}