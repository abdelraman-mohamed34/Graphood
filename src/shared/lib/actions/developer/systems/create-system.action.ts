'use server'

import { SystemInsert } from "@/shared/lib/schemas/systems.schema";
import { createSupabaseServerClient } from "@/shared/lib/supabase/server";
import { fetchUser } from "@/shared/lib/supabase/services/auth/user/fetch-user.service";
import { createSystem } from "@/shared/lib/supabase/services/systems";

export async function createSystemAction(data: SystemInsert) {
    const supabase = await createSupabaseServerClient();
    const user = await fetchUser(supabase);

    if (!user) {
        throw new Error("system error: required user");
    }

    const payload: SystemInsert = {
        ...data,
        owner_id: user.id,
    };

    return await createSystem(payload);
}