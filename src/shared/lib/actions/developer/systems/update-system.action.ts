'use server'

import { getSystemById, updateSystem } from "@/shared/lib/supabase/services/systems";
import { SystemUpdate } from "@/shared/lib/schemas/systems.schema";
import { SupabaseClient } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/shared/lib/supabase/server";
import { fetchUser } from "@/shared/lib/supabase/services/auth/user/fetch-user.service";

export async function updateSystemAction(
    id: string,
    data: SystemUpdate,
) {
    const supabase: SupabaseClient = await createSupabaseServerClient();
    const user = await fetchUser(supabase);

    if (!user) {
        throw new Error("system error: required user");
    }

    const existingSystem = await getSystemById(id, supabase);

    if (!existingSystem) {
        throw new Error("system error: System not found");
    }

    if (existingSystem.owner_id !== user.id) {
        throw new Error("system error: You don't have permissions to do this action");
    }

    return await updateSystem(id, data);
}