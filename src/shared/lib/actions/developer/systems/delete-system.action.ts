'use server'
import { createSupabaseServerClient } from "@/shared/lib/supabase/server";
import { fetchUser } from "@/shared/lib/supabase/services/auth/user/fetch-user.service";
import { deleteSystem, getSystemById } from "@/shared/lib/supabase/services/systems";
import { SupabaseClient } from "@supabase/supabase-js";
import { getSystemAction } from "./get-system.action";

export async function deleteSystemAction(id: string) {
    const supabase: SupabaseClient = await createSupabaseServerClient()

    const system = await getSystemAction(id, supabase)

    if (!system) {
        throw new Error("system error: returned system not found")
    }

    return await deleteSystem(id, supabase);
}